using Microsoft.EntityFrameworkCore;
using ReactMovie.Server.Models;

namespace ReactMovie.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<Screening> Screenings { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>(b =>
            {
                b.HasKey(u => u.Id);
                b.Property(u => u.RowVersion).IsRowVersion();
                b.Property(u => u.IsAdmin).HasDefaultValue(false);
            });

            modelBuilder.Entity<Cinema>(b =>
            {
                b.HasKey(c => c.Id);
            });

            modelBuilder.Entity<Screening>(b =>
            {
                b.HasKey(s => s.Id);
                b.HasOne(s => s.Cinema).WithMany().HasForeignKey(s => s.CinemaId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Reservation>(b =>
            {
                b.HasKey(r => r.Id);
                b.HasIndex(r => new { r.ScreeningId, r.Row, r.Seat }).IsUnique();
                b.HasOne(r => r.Screening).WithMany(s => s.Reservations).HasForeignKey(r => r.ScreeningId).OnDelete(DeleteBehavior.Cascade);
                b.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
