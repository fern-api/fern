using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

[Serializable]
public record Generateequest
{
    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = false;

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
