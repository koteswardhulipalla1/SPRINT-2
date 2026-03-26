using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Services;
using Xunit;

namespace RentAPlace.Tests
{
    public class AuthServiceTests : IDisposable
    {
        private readonly AppDbContext _db;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer("Server=KOTESWAR\\SQLEXPRESS;Database=RentAPlaceDb;Trusted_Connection=True;TrustServerCertificate=True;")
                .Options;

            _db = new AppDbContext(options);

            // Mock basic JWT config so the service doesn't blow up
            var mockConfigDict = new Dictionary<string, string?>
            {
                {"Jwt:Key", "SuperSecretKeyForIntegrationTestingOnly"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };
            var configData = new ConfigurationBuilder().AddInMemoryCollection(mockConfigDict).Build();

            _authService = new AuthService(_db, configData);
        }

        [Fact]
        public async Task LoginWithFakeUser_ShouldReturnNull()
        {
            var loginAttempt = new LoginDto
            {
                Email = "nobody@nowhere.com",
                Password = "incorrect_password"
            };

            var outcome = await _authService.Login(loginAttempt);

            // Assert
            Assert.Null(outcome);
        }

        public void Dispose()
        {
            _db.Dispose();
        }
    }
}
