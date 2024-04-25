using System.Text.Json.Serialization;

namespace SeedResponseProperty;

public class Movie
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
