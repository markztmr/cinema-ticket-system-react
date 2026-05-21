using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(24);
    options.Cookie.Name = ".AspNetCore.Session";
    options.Cookie.Path = "/";
    options.Cookie.IsEssential = true;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = "Server=localhost;Port=3306;Database=CinemaDb;Uid=root;Pwd=;";
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

app.UseRouting();
app.UseSession();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
