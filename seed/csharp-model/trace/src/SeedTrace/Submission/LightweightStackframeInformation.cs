using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record LightweightStackframeInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; }

    [JsonPropertyName("topStackFrameMethodName")]
    public required string TopStackFrameMethodName { get; }
}
