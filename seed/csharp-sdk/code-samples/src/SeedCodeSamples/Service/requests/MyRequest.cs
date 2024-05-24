using System.Text.Json.Serialization;

namespace SeedCodeSamples;

public class MyRequest
{
    [JsonPropertyName("num_events")]
    public int NumEvents { get; init; }
}
