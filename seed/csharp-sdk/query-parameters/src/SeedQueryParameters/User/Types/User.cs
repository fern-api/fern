using System.Text.Json.Serialization;

#nullable enable

namespace SeedQueryParameters;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<string> Tags { get; set; } = new List<string>();
}
