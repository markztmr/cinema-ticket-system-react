namespace ReactApp1.Server.DTOs
{
    public class CinemaResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }
    }

    public class ScreeningRequest
    {
        public int CinemaId { get; set; }
        public string Title { get; set; } = "";
        public DateTime StartTime { get; set; }
    }

    public class ScreeningResponse
    {
        public int Id { get; set; }
        public int CinemaId { get; set; }
        public CinemaResponse? Cinema { get; set; }
        public string Title { get; set; } = "";
        public DateTime StartTime { get; set; }
    }

    public class ScreeningDetailResponse
    {
        public int Id { get; set; }
        public int CinemaId { get; set; }
        public CinemaResponse? Cinema { get; set; }
        public string Title { get; set; } = "";
        public DateTime StartTime { get; set; }
        public List<ReservationResponse> Reservations { get; set; } = new();
    }

    public class ReservationRequest
    {
        public int Row { get; set; }
        public int Seat { get; set; }
    }

    public class ReservationResponse
    {
        public int Id { get; set; }
        public int ScreeningId { get; set; }
        public int? UserId { get; set; }
        public int Row { get; set; }
        public int Seat { get; set; }
    }

    public class BookingResponse
    {
        public int Id { get; set; }
        public ScreeningResponse? Screening { get; set; }
        public int Row { get; set; }
        public int Seat { get; set; }
    }
}
