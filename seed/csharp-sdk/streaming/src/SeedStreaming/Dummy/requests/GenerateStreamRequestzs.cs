using System.Text.Json.Serialization;

namespace SeedStreaming;

public class GenerateStreamRequestzs
{
    [JsonPropertyName("num_events")]
    public int NumEvents { get; init; }
}
