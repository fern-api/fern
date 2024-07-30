using System.Text.Json.Serialization;

#nullable enable

namespace SeedErrorProperty;

public record PropertyBasedErrorTestBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }
}
