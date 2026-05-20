using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models
{
    public class ApplicationUser
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "First name is required")]
        [StringLength(100)]
        public required string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(100)]
        public required string LastName { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [StringLength(20)]
        [Phone(ErrorMessage = "Please enter a valid phone number")]
        public required string PhoneNumber { get; set; }

        public bool IsAdmin { get; set; } = false;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(255, ErrorMessage = "Password hash exceeds maximum length")]
        public required string Password { get; set; }

        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }
}
