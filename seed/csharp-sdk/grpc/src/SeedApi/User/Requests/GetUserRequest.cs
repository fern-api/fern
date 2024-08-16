namespace SeedApi;

public record GetUserRequest
{
    public string? Username { get; set; }

    public uint? Age { get; set; }

    public float? Weight { get; set; }
}
