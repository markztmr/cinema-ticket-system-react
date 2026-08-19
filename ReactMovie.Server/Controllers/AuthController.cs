using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactMovie.Server.Data;
using ReactMovie.Server.Models;
using ReactMovie.Server.DTOs;
using BCrypt.Net;

namespace ReactMovie.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthController(ApplicationDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
            {
                return BadRequest(new { error = "A user with this phone number already exists." });
            }

            var user = new ApplicationUser
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Password = HashPassword(request.Password),
                IsAdmin = false
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserName", $"{user.FirstName} {user.LastName}");

            return Ok(new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = user.IsAdmin,
                RowVersion = user.RowVersion
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResponse>> Login(LoginRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);

            if (user == null || !VerifyPassword(request.Password, user.Password))
            {
                return Unauthorized(new { error = "Invalid phone number or password." });
            }

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserName", $"{user.FirstName} {user.LastName}");

            if (user.IsAdmin)
            {
                HttpContext.Session.SetInt32("IsAdmin", 1);
            }
            else
            {
                HttpContext.Session.Remove("IsAdmin");
            }

            return Ok(new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = user.IsAdmin,
                RowVersion = user.RowVersion
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserResponse>> GetCurrentUser()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var user = await _db.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = user.IsAdmin,
                RowVersion = user.RowVersion
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUser(int id)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var isAdmin = HttpContext.Session.GetInt32("IsAdmin") == 1;

            if (currentUserId != id && !isAdmin)
            {
                return Unauthorized();
            }

            var user = await _db.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = user.IsAdmin,
                RowVersion = user.RowVersion
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponse>> UpdateUser(int id, UpdateUserRequest request)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var isAdmin = HttpContext.Session.GetInt32("IsAdmin") == 1;

            if (currentUserId != id && !isAdmin)
            {
                return Unauthorized();
            }

            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            if (request.PhoneNumber != user.PhoneNumber && await _db.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
            {
                return BadRequest(new { error = "Phone number already in use." });
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;

            if (!string.IsNullOrEmpty(request.Password))
            {
                user.Password = HashPassword(request.Password);
            }

            var entry = _db.Users.Attach(user);
            entry.State = EntityState.Modified;

            if (request.RowVersion != null)
            {
                entry.Property(u => u.RowVersion).OriginalValue = request.RowVersion;
            }

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await ex.Entries.Single().ReloadAsync();
                var currentUser = (ApplicationUser)ex.Entries.Single().Entity;

                return Conflict(new { error = "User was modified by another process. Please refresh and try again." });
            }

            return Ok(new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = user.IsAdmin,
                RowVersion = user.RowVersion
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var isAdmin = HttpContext.Session.GetInt32("IsAdmin") == 1;
            if (!isAdmin)
            {
                return Unauthorized();
            }

            var user = await _db.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully." });
        }

        [HttpGet]
        public async Task<ActionResult<List<UserResponse>>> GetAllUsers()
        {
            var isAdmin = HttpContext.Session.GetInt32("IsAdmin") == 1;
            if (!isAdmin)
            {
                return Unauthorized();
            }

            var users = await _db.Users.ToListAsync();
            return Ok(users.Select(u => new UserResponse
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.PhoneNumber,
                IsAdmin = u.IsAdmin,
                RowVersion = u.RowVersion
            }).ToList());
        }
    }
}
