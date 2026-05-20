namespace ReactApp1.Server.Models
{
    public class Cinema
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }
    }
}
