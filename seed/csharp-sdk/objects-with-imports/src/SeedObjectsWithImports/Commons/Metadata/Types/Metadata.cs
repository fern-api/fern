using System.Text.Json.Serialization;

namespace SeedObjectsWithImports.Commons;

public class Metadata
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("data")]
    public Dictionary<string, string>? Data { get; init; }
}
