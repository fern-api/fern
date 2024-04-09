using System.Text.Json.Serialization;

namespace SeedStreaming;

public class StreamResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public List<string?> Name { get; init; }
}
