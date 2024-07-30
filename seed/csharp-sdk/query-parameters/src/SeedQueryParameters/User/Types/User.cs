using System.Text.Json.Serialization;

#nullable enable

namespace SeedQueryParameters;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("tags")]
    public IEnumerable<string> Tags { get; } = new List<string>();
}
