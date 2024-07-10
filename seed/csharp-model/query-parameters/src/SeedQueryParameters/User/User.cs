using System.Text.Json.Serialization;

#nullable enable

namespace SeedQueryParameters;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("tags")]
    public IEnumerable<string> Tags { get; init; } = new List<string>();
}
