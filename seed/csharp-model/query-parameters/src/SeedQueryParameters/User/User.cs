using System.Text.Json.Serialization;

#nullable enable

namespace SeedQueryParameters;

public class User
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("tags")]
    public IEnumerable<string> Tags { get; init; }
}
