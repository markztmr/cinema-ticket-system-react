namespace ReactApp1.Server.DTOs
{
    public class RegisterRequest
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginRequest
    {
        public string PhoneNumber { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class UpdateUserRequest
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string? Password { get; set; }
        public byte[]? RowVersion { get; set; }
    }

    public class UserResponse
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public bool IsAdmin { get; set; }
        public byte[]? RowVersion { get; set; }
    }
}
