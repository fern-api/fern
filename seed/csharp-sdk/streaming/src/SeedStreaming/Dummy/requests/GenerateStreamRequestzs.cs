using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public class GenerateStreamRequestzs
{
    [JsonPropertyName("num_events")]
    public int NumEvents { get; init; }
}
