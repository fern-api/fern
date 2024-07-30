using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
