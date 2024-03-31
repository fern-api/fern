using System.Text.Json.Serialization;

namespace Client.Commons;

public class Metadata
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("data")]
    public Dictionary<string, string>? Data { get; init; }

    [JsonPropertyName("jsonString")]
    public string? JsonString { get; init; }
}
