using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RentAPlace.API.Data;
using RentAPlace.API.Services;
using RentAPlace.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext - SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PropertyService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<EmailService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "RentAPlaceSecretKey12345678901234567890";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "RentAPlace",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "RentAPlaceUsers",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// CORS - Allow Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4300")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Controllers + JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Initial DB setup and data seeding
using (var initializationScope = app.Services.CreateScope())
{
    var myDbContext = initializationScope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Make sure the DB is actually there
    myDbContext.Database.EnsureCreated();

    // Check if we have any categories - if not, let's add some defaults
    if (!myDbContext.Categories.Any())
    {
        Console.WriteLine("Seeding initial categories into the database...");
        myDbContext.Categories.AddRange(
            new Category { Name = "Beach House" },
            new Category { Name = "Mountain Retreat" },
            new Category { Name = "City Apartment" },
            new Category { Name = "Countryside Villa" },
            new Category { Name = "Luxury Estate" }
        );
        myDbContext.SaveChanges();
    }
}

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RentAPlace API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAngular");

// Explicitly serve static files from the uploads folder to avoid missing pics
app.UseStaticFiles(); // Default wwwroot
var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();