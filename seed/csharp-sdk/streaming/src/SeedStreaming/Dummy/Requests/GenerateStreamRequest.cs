using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public record GenerateStreamRequest
{
    [JsonPropertyName("stream")]
    public required bool Stream { get; }

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; }
}
