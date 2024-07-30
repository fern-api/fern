using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public record Generateequest
{
    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }
}
