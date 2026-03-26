using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentAPlace.API.DTOs;
using RentAPlace.API.Services;

namespace RentAPlace.API.Controllers
{
    // AuthController.cs - Handles user registration and logging in
    // This is the gatekeeper for our app's security
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authManager;

        public AuthController(AuthService authService)
        {
            _authManager = authService;
        }

        // POST api/auth/register - Creates a new user in the system
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterDto registerData)
        {
            // Try to create the new account using the service
            var createResult = await _authManager.Register(registerData);

            // If it returns null, it likely means the email is taken
            if (createResult == null)
            {
                return BadRequest(new { message = "That email address is already registered." });
            }

            // Return the new user info along with the JWT token
            return Ok(createResult);
        }

        // POST api/auth/login - Authenticates a user and returns a token
        [HttpPost("login")]
        public async Task<IActionResult> LoginUser([FromBody] LoginDto loginData)
        {
            // Authenticate the user against the database
            var loginResult = await _authManager.Login(loginData);

            // Unauthorized if the credentials don't match anything we have
            if (loginResult == null)
            {
                return Unauthorized(new { message = "Invalid email or password. Please try again." });
            }

            return Ok(loginResult);
        }

        // GET api/auth/profile - Returns info about the currently logged in user
        [HttpGet("profile")]
        [Authorize]
        public IActionResult GetCurrentUserProfile()
        {
            // Extract the user details from the JWT claims payload
            var foundId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserId = string.IsNullOrEmpty(foundId) ? 0 : int.Parse(foundId);

            var fullName = User.FindFirst(ClaimTypes.Name)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var assignedRole = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new 
            { 
                userId = currentUserId, 
                name = fullName, 
                email = userEmail, 
                role = assignedRole 
            });
        }
    }
}
