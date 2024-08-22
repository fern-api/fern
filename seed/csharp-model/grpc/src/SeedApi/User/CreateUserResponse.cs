using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record CreateUserResponse
{
    [JsonPropertyName("user")]
    public required User User { get; set; }
}
