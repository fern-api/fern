using System.Text.Json.Serialization
using SeedResponsePropertyClient

namespace SeedResponsePropertyClient

public class Response
{
    [JsonPropertyName("data")]
    public Movie Data { get; init; }
    [JsonPropertyName("metadata")]
    public Dictionary<string,string> Metadata { get; init; }
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
