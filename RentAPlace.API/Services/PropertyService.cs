using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Models;

namespace RentAPlace.API.Services
{
    // PropertyService.cs - Main logic for handling properties
    // This handles all the data fetching and mapping for our real estate listings
    public class PropertyService
    {
        private readonly AppDbContext _context;

        public PropertyService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PropertyDto>> GetAllProperties()
        {
            var properties = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Features)
                .Where(p => p.IsAvailable)
                .ToListAsync();

            var results = new List<PropertyDto>();
            foreach (var item in properties)
            {
                results.Add(CreateDisplayObject(item));
            }
            return results;
        }

        public async Task<PropertyDto?> GetPropertyById(int id)
        {
            var singleProp = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.Images.OrderBy(img => img.DisplayOrder))
                .Include(p => p.Features)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (singleProp == null) return null;

            return CreateDisplayObject(singleProp);
        }

        public async Task<List<PropertyDto>> GetPropertiesByOwner(int ownerId)
        {
            var myProps = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Features)
                .Where(p => p.OwnerId == ownerId)
                .ToListAsync();

            var mappedList = new List<PropertyDto>();
            foreach (var p in myProps) 
            {
                mappedList.Add(CreateDisplayObject(p));
            }
            return mappedList;
        }

        public async Task<List<PropertyDto>> GetTopRated(int count = 10)
        {
            var famousStays = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Features)
                .Where(p => p.IsAvailable)
                .OrderByDescending(p => p.Rating)
                .Take(count)
                .ToListAsync();

            var browseList = new List<PropertyDto>();
            foreach (var stay in famousStays)
            {
                browseList.Add(CreateDisplayObject(stay));
            }
            return browseList;
        }

        public async Task<List<PropertyDto>> GetTopRatedByCategory(int categoryId, int count = 5)
        {
            var groupedFamousStays = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Features)
                .Where(p => p.IsAvailable && p.CategoryId == categoryId)
                .OrderByDescending(p => p.Rating)
                .Take(count)
                .ToListAsync();

            var results = new List<PropertyDto>();
            foreach (var row in groupedFamousStays)
            {
                results.Add(CreateDisplayObject(row));
            }
            return results;
        }

        public async Task<List<PropertyDto>> SearchProperties(PropertySearchDto search)
        {
            var dbQuery = _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Features)
                .Include(p => p.Reservations)
                .Where(p => p.IsAvailable)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search.City))
                dbQuery = dbQuery.Where(p => p.City.ToLower().Contains(search.City.ToLower()));

            if (!string.IsNullOrEmpty(search.Country))
                dbQuery = dbQuery.Where(p => p.Country.ToLower().Contains(search.Country.ToLower()));

            if (!string.IsNullOrEmpty(search.PropertyType))
                dbQuery = dbQuery.Where(p => p.PropertyType.ToLower() == search.PropertyType.ToLower());

            if (search.MinPrice.HasValue)
                dbQuery = dbQuery.Where(p => p.PricePerNight >= search.MinPrice.Value);

            if (search.MaxPrice.HasValue)
                dbQuery = dbQuery.Where(p => p.PricePerNight <= search.MaxPrice.Value);

            if (search.CheckIn.HasValue && search.CheckOut.HasValue)
            {
                dbQuery = dbQuery.Where(p => !p.Reservations.Any(r =>
                    r.Status != "Cancelled" &&
                    r.CheckInDate < search.CheckOut.Value &&
                    r.CheckOutDate > search.CheckIn.Value));
            }

            if (search.Features != null && search.Features.Any())
            {
                foreach (var feature in search.Features)
                {
                    dbQuery = dbQuery.Where(p => p.Features.Any(f =>
                        f.FeatureName.ToLower() == feature.ToLower()));
                }
            }

            dbQuery = search.SortBy?.ToLower() switch
            {
                "price" => search.SortDescending
                    ? dbQuery.OrderByDescending(p => p.PricePerNight)
                    : dbQuery.OrderBy(p => p.PricePerNight),
                "rating" => search.SortDescending
                    ? dbQuery.OrderByDescending(p => p.Rating)
                    : dbQuery.OrderBy(p => p.Rating),
                "title" => search.SortDescending
                    ? dbQuery.OrderByDescending(p => p.Title)
                    : dbQuery.OrderBy(p => p.Title),
                _ => dbQuery.OrderByDescending(p => p.Rating)
            };

            var finalQueryData = await dbQuery.ToListAsync();

            var displayResults = new List<PropertyDto>();
            foreach (var stayRecord in finalQueryData)
            {
                displayResults.Add(CreateDisplayObject(stayRecord));
            }
            return displayResults;
        }

        public async Task<PropertyDto?> CreateProperty(int ownerId, CreatePropertyDto dto)
        {
            var property = new Property
            {
                Title = dto.Title,
                Description = dto.Description,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country,
                PricePerNight = dto.PricePerNight,
                PropertyType = dto.PropertyType,
                OwnerId = ownerId,
                CategoryId = dto.CategoryId,
                IsAvailable = true
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            if (dto.Features.Any())
            {
                foreach (var feature in dto.Features)
                {
                    _context.PropertyFeatures.Add(new PropertyFeature
                    {
                        PropertyId = property.Id,
                        FeatureName = feature
                    });
                }
                await _context.SaveChangesAsync();
            }

            return await GetPropertyById(property.Id);
        }

        public async Task<PropertyDto?> UpdateProperty(int ownerId, int propertyId, UpdatePropertyDto dto)
        {
            var property = await _context.Properties
                .Include(p => p.Features)
                .FirstOrDefaultAsync(p => p.Id == propertyId && p.OwnerId == ownerId);

            if (property == null) return null;

            if (dto.Title != null) property.Title = dto.Title;
            if (dto.Description != null) property.Description = dto.Description;
            if (dto.Address != null) property.Address = dto.Address;
            if (dto.City != null) property.City = dto.City;
            if (dto.Country != null) property.Country = dto.Country;
            if (dto.PricePerNight.HasValue) property.PricePerNight = dto.PricePerNight.Value;
            if (dto.PropertyType != null) property.PropertyType = dto.PropertyType;
            if (dto.CategoryId.HasValue) property.CategoryId = dto.CategoryId;
            if (dto.IsAvailable.HasValue) property.IsAvailable = dto.IsAvailable.Value;

            if (dto.Features != null)
            {
                _context.PropertyFeatures.RemoveRange(property.Features);
                foreach (var feature in dto.Features)
                {
                    _context.PropertyFeatures.Add(new PropertyFeature
                    {
                        PropertyId = property.Id,
                        FeatureName = feature
                    });
                }
            }

            await _context.SaveChangesAsync();
            return await GetPropertyById(property.Id);
        }

        public async Task<bool> DeleteProperty(int ownerId, int propertyId)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.Id == propertyId && p.OwnerId == ownerId);

            if (property == null) return false;

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PropertyImage?> AddImage(int ownerId, int targetPropertyId, string finalUrl)
        {
            var myProperty = await _context.Properties
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == targetPropertyId && p.OwnerId == ownerId);

            if (myProperty == null) return null;

            if (myProperty.Images.Count >= 6) return null;

            var currentMaxOrder = myProperty.Images.Any() ? myProperty.Images.Max(img => img.DisplayOrder) : 0;
            
            var newImage = new PropertyImage
            {
                PropertyId = targetPropertyId,
                ImageUrl = finalUrl,
                DisplayOrder = currentMaxOrder + 1
            };

            _context.PropertyImages.Add(newImage);
            await _context.SaveChangesAsync();
            
            return newImage;
        }

        public async Task<bool> RemoveImage(int ownerId, int targetImageId)
        {
            var targetImg = await _context.PropertyImages
                .Include(i => i.Property)
                .FirstOrDefaultAsync(i => i.Id == targetImageId);

            if (targetImg == null || targetImg.Property?.OwnerId != ownerId)
            {
                return false;
            }

            _context.PropertyImages.Remove(targetImg);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> RateProperty(int targetId, double userRating)
        {
            var targetProp = await _context.Properties.FindAsync(targetId);
            if (targetProp == null) return false;

            // Simple math for the new average rating
            // Formula: ((CurrentRating * RatingCount) + NewRating) / (RatingCount + 1)
            double currentTotalSum = targetProp.Rating * targetProp.RatingCount;
            int newTotalCount = targetProp.RatingCount + 1;
            
            targetProp.Rating = (currentTotalSum + userRating) / newTotalCount;
            targetProp.RatingCount = newTotalCount;

            await _context.SaveChangesAsync();
            return true;
        }

        private static PropertyDto CreateDisplayObject(Property p)
        {
            string owner = p.Owner != null ? p.Owner.FullName : "Unknown Owner";
            string catName = p.Category != null ? p.Category.Name : "General/Default";

            var finalGallery = new List<PropertyImageDto>();
            foreach (var imgRecord in p.Images.OrderBy(i => i.DisplayOrder))
            {
                var dto = new PropertyImageDto
                {
                    Id = imgRecord.Id,
                    ImageUrl = imgRecord.ImageUrl
                };
                finalGallery.Add(dto);
            }

            var featuresList = new List<string>();
            foreach (var feature in p.Features)
            {
                featuresList.Add(feature.FeatureName);
            }

            var result = new PropertyDto();
            result.Id = p.Id;
            result.Title = p.Title;
            result.Description = p.Description;
            result.Address = p.Address;
            result.City = p.City;
            result.Country = p.Country;
            result.PricePerNight = p.PricePerNight;
            result.PropertyType = p.PropertyType;
            result.OwnerId = p.OwnerId;
            result.OwnerName = owner;
            result.CategoryId = p.CategoryId;
            result.CategoryName = catName;
            result.Rating = p.Rating;
            result.RatingCount = p.RatingCount;
            result.IsAvailable = p.IsAvailable;
            result.Images = finalGallery;
            result.Features = featuresList;

            return result;
        }
    }
}
