using System.Text.Json.Serialization;

namespace SeedExamples.Commons;

public class Metadata
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("data")]
    public List<List<Dictionary<string, string>>?> Data { get; init; }

    [JsonPropertyName("jsonString")]
    public List<string?> JsonString { get; init; }
}
