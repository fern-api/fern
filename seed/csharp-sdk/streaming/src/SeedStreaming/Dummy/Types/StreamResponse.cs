using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public class StreamResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}
