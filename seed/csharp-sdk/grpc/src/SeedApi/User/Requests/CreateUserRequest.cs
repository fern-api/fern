using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record CreateUserRequest
{
    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("age")]
    public uint? Age { get; set; }

    [JsonPropertyName("weight")]
    public float? Weight { get; set; }
}
