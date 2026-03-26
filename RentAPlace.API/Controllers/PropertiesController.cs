using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentAPlace.API.DTOs;
using RentAPlace.API.Services;

namespace RentAPlace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly PropertyService _propertyService;
        private readonly IWebHostEnvironment _env;

        public PropertiesController(PropertyService propertyService, IWebHostEnvironment env)
        {
            _propertyService = propertyService;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var properties = await _propertyService.GetAllProperties();
            return Ok(properties);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var property = await _propertyService.GetPropertyById(id);
            if (property == null)
                return NotFound(new { message = "Property not found" });
            return Ok(property);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated([FromQuery] int count = 10)
        {
            var properties = await _propertyService.GetTopRated(count);
            return Ok(properties);
        }

        [HttpGet("top-rated/category/{categoryId}")]
        public async Task<IActionResult> GetTopRatedByCategory(int categoryId, [FromQuery] int count = 5)
        {
            var properties = await _propertyService.GetTopRatedByCategory(categoryId, count);
            return Ok(properties);
        }

        [HttpPost("search")]
        public async Task<IActionResult> Search([FromBody] PropertySearchDto search)
        {
            var properties = await _propertyService.SearchProperties(search);
            return Ok(properties);
        }

        [HttpGet("owner")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetMyProperties()
        {
            var ownerId = GetUserId();
            var properties = await _propertyService.GetPropertiesByOwner(ownerId);
            return Ok(properties);
        }

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Create([FromBody] CreatePropertyDto dto)
        {
            var ownerId = GetUserId();
            var property = await _propertyService.CreateProperty(ownerId, dto);
            return CreatedAtAction(nameof(GetById), new { id = property!.Id }, property);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePropertyDto dto)
        {
            var ownerId = GetUserId();
            var property = await _propertyService.UpdateProperty(ownerId, id, dto);
            if (property == null)
                return NotFound(new { message = "Property not found or not owned by you" });
            return Ok(property);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Delete(int id)
        {
            var ownerId = GetUserId();
            var result = await _propertyService.DeleteProperty(ownerId, id);
            if (!result)
                return NotFound(new { message = "Property not found or not owned by you" });
            return Ok(new { message = "Property deleted successfully" });
        }

        [HttpPost("{id}/images")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "properties");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/properties/{fileName}";
            var ownerId = GetUserId();
            var image = await _propertyService.AddImage(ownerId, id, imageUrl);

            if (image == null)
                return NotFound(new { message = "Property not found or not owned by you" });

            return Ok(image);
        }

        // Endpoint to let guests add a rating to a property
        [HttpPost("{id}/rate")]
        [Authorize] // You must be logged in to leave a review
        public async Task<IActionResult> Rate(int id, [FromBody] RatingInput input)
        {
            // Simple validation: rating should be between 1 and 5 stars
            if (input == null || input.UserValue < 1 || input.UserValue > 5)
            {
                return BadRequest(new { message = "Rating must be between 1.0 and 5.0 stars" });
            }

            // Apply the rating through the service
            var result = await _propertyService.RateProperty(id, input.UserValue);
            
            // If the property id was wrong or something failed
            if (!result) return NotFound(new { message = "We couldn't find that property to rate it." });

            return Ok(new { message = "Thank you for your rating!" });
        }

        // Allow owners to clean up their gallery by deleting specific images
        [HttpDelete("images/{imageId}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            // Identity Check
            var myUserId = GetUserId();
            var successResult = await _propertyService.RemoveImage(myUserId, imageId);
            
            // Basic error handling for invalid IDs or unauthorized deletes
            if (!successResult) return NotFound(new { message = "Couldn't find that image or it's not yours." });

            return Ok(new { message = "Photo removed from gallery!" });
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}
