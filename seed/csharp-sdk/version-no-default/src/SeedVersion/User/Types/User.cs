using System.Text.Json.Serialization;

#nullable enable

namespace SeedVersion;

public record User
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
