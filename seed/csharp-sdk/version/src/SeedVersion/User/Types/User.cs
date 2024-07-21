using System.Text.Json.Serialization;

#nullable enable

namespace SeedVersion;

public record User
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }
}
