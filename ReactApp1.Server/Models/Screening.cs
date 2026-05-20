using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class Screening
    {
        public int Id { get; set; }
        public int CinemaId { get; set; }
        public required Cinema Cinema { get; set; }

        [Required(ErrorMessage = "Movie title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Start time is required")]
        public DateTime StartTime { get; set; }

        public List<Reservation> Reservations { get; set; } = new();
    }
}
