using System.Text.Json.Serialization;
using SeedResponseProperty;

namespace SeedResponseProperty;

public class Response
{
    [JsonPropertyName("data")]
    public Movie Data { get; init; }

    [JsonPropertyName("metadata")]
    public List<Dictionary<string, string>> Metadata { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
