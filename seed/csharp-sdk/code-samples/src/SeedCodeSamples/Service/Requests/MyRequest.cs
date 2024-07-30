using System.Text.Json.Serialization;

#nullable enable

namespace SeedCodeSamples;

public record MyRequest
{
    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }
}
