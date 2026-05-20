using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.DTOs;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CinemasController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CinemasController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<CinemaResponse>>> GetCinemas()
        {
            var cinemas = await _db.Cinemas.ToListAsync();
            return Ok(cinemas.Select(c => new CinemaResponse
            {
                Id = c.Id,
                Name = c.Name,
                Rows = c.Rows,
                SeatsPerRow = c.SeatsPerRow
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CinemaResponse>> GetCinema(int id)
        {
            var cinema = await _db.Cinemas.FindAsync(id);
            if (cinema == null)
            {
                return NotFound();
            }

            return Ok(new CinemaResponse
            {
                Id = cinema.Id,
                Name = cinema.Name,
                Rows = cinema.Rows,
                SeatsPerRow = cinema.SeatsPerRow
            });
        }
    }
}
