using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

[Serializable]
public record GenerateRequest
{
    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
