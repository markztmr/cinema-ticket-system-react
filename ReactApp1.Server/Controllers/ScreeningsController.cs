using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;
using ReactApp1.Server.DTOs;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScreeningsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ScreeningsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<ScreeningResponse>>> GetScreenings()
        {
            var screenings = await _db.Screenings.Include(s => s.Cinema).ToListAsync();
            return Ok(screenings.Select(s => new ScreeningResponse
            {
                Id = s.Id,
                CinemaId = s.CinemaId,
                Cinema = new CinemaResponse
                {
                    Id = s.Cinema.Id,
                    Name = s.Cinema.Name,
                    Rows = s.Cinema.Rows,
                    SeatsPerRow = s.Cinema.SeatsPerRow
                },
                Title = s.Title,
                StartTime = s.StartTime
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScreeningDetailResponse>> GetScreening(int id)
        {
            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .Include(s => s.Reservations)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound();
            }

            return Ok(new ScreeningDetailResponse
            {
                Id = screening.Id,
                CinemaId = screening.CinemaId,
                Cinema = new CinemaResponse
                {
                    Id = screening.Cinema.Id,
                    Name = screening.Cinema.Name,
                    Rows = screening.Cinema.Rows,
                    SeatsPerRow = screening.Cinema.SeatsPerRow
                },
                Title = screening.Title,
                StartTime = screening.StartTime,
                Reservations = screening.Reservations.Select(r => new ReservationResponse
                {
                    Id = r.Id,
                    ScreeningId = r.ScreeningId,
                    UserId = r.UserId,
                    Row = r.Row,
                    Seat = r.Seat
                }).ToList()
            });
        }

        [HttpPost]
        public async Task<ActionResult<ScreeningResponse>> CreateScreening(ScreeningRequest request)
        {
            var isAdmin = HttpContext.Session.GetInt32("IsAdmin") == 1;
            if (!isAdmin)
            {
                return Unauthorized();
            }

            var cinema = await _db.Cinemas.FindAsync(request.CinemaId);
            if (cinema == null)
            {
                return BadRequest(new { error = "Cinema not found." });
            }

            var screening = new Screening
            {
                CinemaId = request.CinemaId,
                Cinema = cinema,
                Title = request.Title,
                StartTime = request.StartTime
            };

            _db.Screenings.Add(screening);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetScreening), new { id = screening.Id }, new ScreeningResponse
            {
                Id = screening.Id,
                CinemaId = screening.CinemaId,
                Cinema = new CinemaResponse
                {
                    Id = cinema.Id,
                    Name = cinema.Name,
                    Rows = cinema.Rows,
                    SeatsPerRow = cinema.SeatsPerRow
                },
                Title = screening.Title,
                StartTime = screening.StartTime
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScreening(int id)
        {
            var isAdmin = HttpContext.Session.GetInt32("IsAdmin") == 1;
            if (!isAdmin)
            {
                return Unauthorized();
            }

            var screening = await _db.Screenings.FindAsync(id);
            if (screening == null)
            {
                return NotFound();
            }

            _db.Screenings.Remove(screening);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Screening deleted successfully." });
        }
    }
}
