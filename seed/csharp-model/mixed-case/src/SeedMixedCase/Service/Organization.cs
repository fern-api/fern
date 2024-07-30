using System.Text.Json.Serialization;

#nullable enable

namespace SeedMixedCase;

public record Organization
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
