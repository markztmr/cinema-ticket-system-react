using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();

// Add Distributed Cache
builder.Services.AddDistributedMemoryCache();

// Add Session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(24);
    options.Cookie.Name = ".AspNetCore.Session";
    options.Cookie.Path = "/";
    options.Cookie.IsEssential = true;
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() 
        ? Microsoft.AspNetCore.Http.CookieSecurePolicy.None 
        : Microsoft.AspNetCore.Http.CookieSecurePolicy.Always;
    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://localhost:64870")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = "Server=localhost;Port=3306;Database=CinemaDb;Uid=root;Pwd=;";
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();

    if (!db.Cinemas.Any())
    {
        db.Cinemas.AddRange(
            new ReactApp1.Server.Models.Cinema { Name = "Cinema A", Rows = 5, SeatsPerRow = 8 },
            new ReactApp1.Server.Models.Cinema { Name = "Cinema B", Rows = 6, SeatsPerRow = 10 },
            new ReactApp1.Server.Models.Cinema { Name = "Cinema C", Rows = 4, SeatsPerRow = 6 }
        );
        db.SaveChanges();
    }

    if (!db.Users.Any())
    {
        var adminUser = new ReactApp1.Server.Models.ApplicationUser
        {
            FirstName = "Admin",
            LastName = "User",
            PhoneNumber = "0000000000",
            Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
            IsAdmin = true
        };
        db.Users.Add(adminUser);
        db.SaveChanges();
    }
}

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
