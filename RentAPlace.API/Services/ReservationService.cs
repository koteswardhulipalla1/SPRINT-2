using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Models;

namespace RentAPlace.API.Services
{
    public class ReservationService
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public ReservationService(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<ReservationDto?> CreateReservation(int userId, CreateReservationDto dto)
        {
            var property = await _context.Properties
                .Include(p => p.Owner)
                .FirstOrDefaultAsync(p => p.Id == dto.PropertyId && p.IsAvailable);

            if (property == null) return null;

            var hasConflict = await _context.Reservations.AnyAsync(r =>
                r.PropertyId == dto.PropertyId &&
                r.Status != "Cancelled" &&
                r.CheckInDate < dto.CheckOutDate &&
                r.CheckOutDate > dto.CheckInDate);

            if (hasConflict) return null;

            var days = (dto.CheckOutDate - dto.CheckInDate).Days;
            if (days <= 0) return null;

            var reservation = new Reservation
            {
                PropertyId = dto.PropertyId,
                UserId = userId,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                TotalPrice = property.PricePerNight * days,
                Status = "Pending"
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            if (property.Owner != null)
            {
                var user = await _context.Users.FindAsync(userId);
                await _emailService.SendReservationNotification(
                    property.Owner.Email,
                    property.Owner.FullName,
                    property.Title,
                    user?.FullName ?? "A user",
                    dto.CheckInDate,
                    dto.CheckOutDate);
            }

            return await GetReservationById(reservation.Id);
        }

        public async Task<ReservationDto?> GetReservationById(int id)
        {
            var r = await _context.Reservations
                .Include(r => r.Property)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            return r == null ? null : ConvertToDto(r);
        }

        public async Task<List<ReservationDto>> GetUserReservations(int guestId)
        {
            var bookingHistory = await _context.Reservations
                .Include(r => r.Property)
                .Include(r => r.User)
                .Where(r => r.UserId == guestId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var guestBookings = new List<ReservationDto>();
            foreach (var booking in bookingHistory)
            {
                guestBookings.Add(ConvertToDto(booking));
            }
            return guestBookings;
        }

        public async Task<List<ReservationDto>> GetOwnerReservations(int hostId)
        {
            var incomingReqs = await _context.Reservations
                .Include(r => r.Property)
                .Include(r => r.User)
                .Where(r => r.Property!.OwnerId == hostId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var hostDashboardList = new List<ReservationDto>();
            foreach (var req in incomingReqs)
            {
                hostDashboardList.Add(ConvertToDto(req));
            }
            return hostDashboardList;
        }

        public async Task<ReservationDto?> UpdateStatus(int reservationId, int ownerId, string status)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Property).ThenInclude(p => p!.Owner)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.Property!.OwnerId == ownerId);

            if (reservation == null) return null;

            reservation.Status = status;
            await _context.SaveChangesAsync();

            if (reservation.User != null)
            {
                if (status == "Confirmed")
                {
                    await _emailService.SendAcceptanceNotification(
                        reservation.User.Email,
                        reservation.User.FullName,
                        reservation.Property?.Title ?? "Property",
                        reservation.Property?.Owner?.FullName ?? "Owner"
                    );
                }
                else if (status == "Cancelled")
                {
                    await _emailService.SendCancellationNotification(
                        reservation.User.Email,
                        reservation.User.FullName,
                        reservation.Property?.Title ?? "Property",
                        "Owner",
                        "Owner"
                    );
                }
            }

            return await GetReservationById(reservationId);
        }

        public async Task<bool> CancelReservation(int reservationId, int userId)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Property)
                .ThenInclude(p => p!.Owner)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);

            if (reservation == null) return false;
            if (reservation.Status == "Cancelled") return true;

            // Business rule: Possible before 48 hrs only
            if (DateTime.UtcNow.AddHours(48) >= reservation.CheckInDate)
                return false;

            reservation.Status = "Cancelled";
            await _context.SaveChangesAsync();

            if (reservation.Property?.Owner != null)
            {
                await _emailService.SendCancellationNotification(
                    reservation.Property.Owner.Email,
                    reservation.Property.Owner.FullName,
                    reservation.Property.Title,
                    reservation.User?.FullName ?? "Renter",
                    "Renter"
                );
            }

            return true;
        }

        private static ReservationDto ConvertToDto(Reservation r)
        {
            var dto = new ReservationDto();
            dto.Id = r.Id;
            dto.PropertyId = r.PropertyId;
            dto.PropertyTitle = r.Property != null ? r.Property.Title : "Unknown";
            dto.PropertyCity = r.Property != null ? r.Property.City : "Unknown";
            dto.UserId = r.UserId;
            dto.UserName = r.User != null ? r.User.FullName : "Guest";
            dto.CheckInDate = r.CheckInDate;
            dto.CheckOutDate = r.CheckOutDate;
            dto.Status = r.Status;
            dto.TotalPrice = r.TotalPrice;
            dto.CreatedAt = r.CreatedAt;
            return dto;
        }
    }
}
