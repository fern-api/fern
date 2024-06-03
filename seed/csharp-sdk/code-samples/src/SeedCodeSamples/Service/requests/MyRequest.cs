using System.Text.Json.Serialization;

#nullable enable

namespace SeedCodeSamples;

public class MyRequest
{
    [JsonPropertyName("num_events")]
    public int NumEvents { get; init; }
}
