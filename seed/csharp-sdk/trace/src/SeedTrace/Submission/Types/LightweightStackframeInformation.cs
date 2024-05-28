using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class LightweightStackframeInformation
{
    [JsonPropertyName("numStackFrames")]
    public int NumStackFrames { get; init; }

    [JsonPropertyName("topStackFrameMethodName")]
    public string TopStackFrameMethodName { get; init; }
}
