using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactMovie.Server.Data;
using ReactMovie.Server.Models;
using ReactMovie.Server.DTOs;

namespace ReactMovie.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ReservationsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("toggle")]
        public async Task<ActionResult<ReservationResponse>> ToggleReservation(int screeningId, int row, int seat)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return Unauthorized(new { error = "You must be logged in to make reservations." });
            }

            var screening = await _db.Screenings.Include(s => s.Cinema).FirstOrDefaultAsync(s => s.Id == screeningId);
            if (screening == null)
            {
                return NotFound(new { error = "Screening not found." });
            }

            if (row < 1 || row > screening.Cinema.Rows || seat < 1 || seat > screening.Cinema.SeatsPerRow)
            {
                return BadRequest(new { error = "Invalid seat." });
            }

            var existing = await _db.Reservations.FirstOrDefaultAsync(r => r.ScreeningId == screeningId && r.Row == row && r.Seat == seat);
            if (existing != null)
            {
                if (existing.UserId != userId.Value)
                {
                    return Forbid();
                }

                _db.Reservations.Remove(existing);
                await _db.SaveChangesAsync();
                return Ok(new { message = "Seat released successfully." });
            }

            var reservation = new Reservation
            {
                Screening = screening,
                ScreeningId = screeningId,
                Row = row,
                Seat = seat,
                UserId = userId.Value
            };

            _db.Reservations.Add(reservation);
            try
            {
                await _db.SaveChangesAsync();
                return Ok(new ReservationResponse
                {
                    Id = reservation.Id,
                    ScreeningId = reservation.ScreeningId,
                    UserId = reservation.UserId,
                    Row = reservation.Row,
                    Seat = reservation.Seat
                });
            }
            catch (DbUpdateException)
            {
                return Conflict(new { error = "Seat already reserved by someone else." });
            }
        }

        [HttpGet("my-bookings")]
        public async Task<ActionResult<List<BookingResponse>>> GetMyBookings()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var reservations = await _db.Reservations
                .Include(r => r.Screening)
                .ThenInclude(s => s.Cinema)
                .Where(r => r.UserId == userId)
                .OrderBy(r => r.Screening.StartTime)
                .ToListAsync();

            return Ok(reservations.Select(r => new BookingResponse
            {
                Id = r.Id,
                Screening = new ScreeningResponse
                {
                    Id = r.Screening.Id,
                    CinemaId = r.Screening.CinemaId,
                    Cinema = new CinemaResponse
                    {
                        Id = r.Screening.Cinema.Id,
                        Name = r.Screening.Cinema.Name,
                        Rows = r.Screening.Cinema.Rows,
                        SeatsPerRow = r.Screening.Cinema.SeatsPerRow
                    },
                    Title = r.Screening.Title,
                    StartTime = r.Screening.StartTime
                },
                Row = r.Row,
                Seat = r.Seat
            }).ToList());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var reservation = await _db.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            if (reservation.UserId != userId.Value)
            {
                return Forbid();
            }

            _db.Reservations.Remove(reservation);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled successfully." });
        }
    }
}
