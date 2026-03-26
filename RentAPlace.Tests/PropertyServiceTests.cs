using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Data;
using RentAPlace.API.Services;
using Xunit;

namespace RentAPlace.Tests
{
    public class PropertyServiceTests : IDisposable
    {
        private readonly AppDbContext _db;
        private readonly PropertyService _pService;

        public PropertyServiceTests()
        {
            // Connect directly to the user's SSMS database for real-world integration testing
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer("Server=KOTESWAR\\SQLEXPRESS;Database=RentAPlaceDb;Trusted_Connection=True;TrustServerCertificate=True;")
                .Options;

            _db = new AppDbContext(options);
            _pService = new PropertyService(_db);
        }

        [Fact]
        public async Task GetAllProperties_ShouldReturnDataFromMyDatabase()
        {
            // Act: Fetch from the live DB
            var results = await _pService.GetAllProperties();

            // Assert: We just want to make sure the fetch succeeded and didn't crash.
            // If the DB is empty, count could be 0, but it shouldn't be null.
            Assert.NotNull(results);
            
            // Helpful debug log for when we run this locally
            Console.WriteLine($"Found {results.Count} properties in the SQL Server.");
        }

        [Fact]
        public async Task GetTopRated_ShouldCapAtRequestedLimit()
        {
            // Act: Ask for top 3
            var topList = await _pService.GetTopRated(3);

            // Assert
            Assert.NotNull(topList);
            Assert.True(topList.Count <= 3, "Service returned more than the specified limit.");
        }

        public void Dispose()
        {
            _db.Dispose();
        }
    }
}
