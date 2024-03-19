using System.Text.Json.Serialization

namespace SeedStreamingClient

public class StreamResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; }
    [JsonPropertyName("name")]
    public string? Name { get; init; }
}
