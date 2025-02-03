using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record LightweightStackframeInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; set; }

    [JsonPropertyName("topStackFrameMethodName")]
    public required string TopStackFrameMethodName { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
