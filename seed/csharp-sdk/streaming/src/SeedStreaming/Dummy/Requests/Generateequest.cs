using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

public record Generateequest
{
    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = false;

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
