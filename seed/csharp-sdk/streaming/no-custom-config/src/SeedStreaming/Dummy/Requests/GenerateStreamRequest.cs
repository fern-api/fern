using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

[Serializable]
public record GenerateStreamRequest
{
    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = true;

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
