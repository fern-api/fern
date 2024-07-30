using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public record Failure
{
    [JsonPropertyName("status")]
    public required string Status { get; set; }
}
