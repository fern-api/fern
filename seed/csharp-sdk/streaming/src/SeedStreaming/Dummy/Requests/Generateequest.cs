using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public class Generateequest
{
    [JsonPropertyName("stream")]
    public bool Stream { get; init; }

    [JsonPropertyName("num_events")]
    public int NumEvents { get; init; }
}
