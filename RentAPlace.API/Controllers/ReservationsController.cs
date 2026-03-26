using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentAPlace.API.DTOs;
using RentAPlace.API.Services;

namespace RentAPlace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService _reservationService;

        public ReservationsController(ReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReservationDto dto)
        {
            var userId = GetUserId();
            var reservation = await _reservationService.CreateReservation(userId, dto);
            if (reservation == null)
                return BadRequest(new { message = "Unable to create reservation. Property may not be available for the selected dates." });

            return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var reservation = await _reservationService.GetReservationById(id);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });
            return Ok(reservation);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyReservations()
        {
            var userId = GetUserId();
            var reservations = await _reservationService.GetUserReservations(userId);
            return Ok(reservations);
        }

        [HttpGet("owner")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetOwnerReservations()
        {
            var ownerId = GetUserId();
            var reservations = await _reservationService.GetOwnerReservations(ownerId);
            return Ok(reservations);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            var ownerId = GetUserId();
            var reservation = await _reservationService.UpdateStatus(id, ownerId, dto.Status);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found or not authorized" });
            return Ok(reservation);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = GetUserId();
            var success = await _reservationService.CancelReservation(id, userId);
            if (!success)
                return BadRequest(new { message = "Cancellation failed. Ensure it is at least 48 hours before check-in." });

            return Ok(new { message = "Reservation cancelled successfully" });
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}
