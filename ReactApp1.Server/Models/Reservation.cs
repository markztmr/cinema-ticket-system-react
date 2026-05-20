namespace ReactApp1.Server.Models
{
    public class Reservation
    {
        public int Id { get; set; }
        public int ScreeningId { get; set; }
        public required Screening Screening { get; set; }

        public int? UserId { get; set; }
        public ApplicationUser? User { get; set; }

        public int Row { get; set; }
        public int Seat { get; set; }
    }
}
