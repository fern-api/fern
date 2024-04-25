using System.Text.Json.Serialization;

namespace SeedExamples;

public class Actress
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("id")]
    public string Id { get; init; }
}
