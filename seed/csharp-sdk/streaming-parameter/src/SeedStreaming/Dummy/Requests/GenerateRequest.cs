using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

public record GenerateRequest
{
    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
