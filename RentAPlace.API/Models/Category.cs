using System.ComponentModel.DataAnnotations;

namespace RentAPlace.API.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public ICollection<Property> Properties { get; set; } = new List<Property>();
    }
}
