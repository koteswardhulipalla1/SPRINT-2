namespace RentAPlace.API.DTOs
{
    // ===== Auth DTOs =====
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Renter";
        public string? Phone { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    // Small DTO for rating submissions
    public class RatingInput
    {
        [System.Text.Json.Serialization.JsonPropertyName("userValue")]
        public double UserValue { get; set; }
    }

    public class PropertyImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class PropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string PropertyType { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public double Rating { get; set; }
        public int RatingCount { get; set; }
        public bool IsAvailable { get; set; }
        public List<PropertyImageDto> Images { get; set; } = new();
        public List<string> Features { get; set; } = new();
    }

    public class CreatePropertyDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string PropertyType { get; set; } = "Apartment";
        public int? CategoryId { get; set; }
        public List<string> Features { get; set; } = new();
    }

    public class UpdatePropertyDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public decimal? PricePerNight { get; set; }
        public string? PropertyType { get; set; }
        public int? CategoryId { get; set; }
        public bool? IsAvailable { get; set; }
        public List<string>? Features { get; set; }
    }

    public class PropertySearchDto
    {
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? PropertyType { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public List<string>? Features { get; set; }
        public string? SortBy { get; set; } // price, rating
        public bool SortDescending { get; set; } = false;
    }

    // ===== Reservation DTOs =====
    public class CreateReservationDto
    {
        public int PropertyId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
    }

    public class ReservationDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public string PropertyCity { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateReservationStatusDto
    {
        public string Status { get; set; } = string.Empty; // Confirmed, Cancelled
    }

    // ===== Message DTOs =====
    public class SendMessageDto
    {
        public int ReceiverId { get; set; }
        public int? PropertyId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class MessageDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public int? PropertyId { get; set; }
        public string? PropertyTitle { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }

    // ===== Category DTOs =====
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PropertyCount { get; set; }
    }
}
