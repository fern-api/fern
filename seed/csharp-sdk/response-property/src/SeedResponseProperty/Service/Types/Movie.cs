using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public record Movie
{
    [JsonPropertyName("id")]
    public required string Id { get; }

    [JsonPropertyName("name")]
    public required string Name { get; }
}
