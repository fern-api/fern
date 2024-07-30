using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public record StringResponse
{
    [JsonPropertyName("data")]
    public required string Data { get; set; }
}
