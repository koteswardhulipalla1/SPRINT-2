using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentAPlace.API.Models
{
    public class PropertyFeature
    {
        [Key]
        public int Id { get; set; }

        public int PropertyId { get; set; }

        [ForeignKey("PropertyId")]
        public Property? Property { get; set; }

        [Required, MaxLength(100)]
        public string FeatureName { get; set; } = string.Empty; // Pool, Beach-facing, Garden, etc.
    }
}
