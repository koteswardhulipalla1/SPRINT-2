using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Models;

namespace RentAPlace.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _settings;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _db = context;
            _settings = config;
        }

        public async Task<AuthResponseDto?> Register(RegisterDto data)
        {
            var existingUser = await _db.Users.AnyAsync(u => u.Email == data.Email);
            if (existingUser) 
            {
                return null;
            }

            var newUser = new User
            {
                FullName = data.FullName,
                Email = data.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(data.Password),
                Role = (data.Role == "Owner") ? "Owner" : "Renter",
                Phone = data.Phone
            };

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();

            return GenerateAuthResponse(newUser);
        }

        public async Task<AuthResponseDto?> Login(LoginDto loginInfo)
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == loginInfo.Email);
            
            if (dbUser == null || !BCrypt.Net.BCrypt.Verify(loginInfo.Password, dbUser.PasswordHash))
            {
                return null;
            }

            return GenerateAuthResponse(dbUser);
        }

        private AuthResponseDto GenerateAuthResponse(User userEntity)
        {
            var myToken = CreateSystemJwtToken(userEntity);
            
            return new AuthResponseDto
            {
                Token = myToken,
                UserId = userEntity.Id,
                FullName = userEntity.FullName,
                Email = userEntity.Email,
                Role = userEntity.Role
            };
        }

        private string CreateSystemJwtToken(User user)
        {
            var keyString = _settings["Jwt:Key"] ?? "RentAPlaceSecretKey12345678901234567890";
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            
            var signingCreds = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var UserClaims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var jwtToken = new JwtSecurityToken(
                issuer: _settings["Jwt:Issuer"] ?? "RentAPlace",
                audience: _settings["Jwt:Audience"] ?? "RentAPlaceUsers",
                claims: UserClaims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: signingCreds);

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
    }
}
