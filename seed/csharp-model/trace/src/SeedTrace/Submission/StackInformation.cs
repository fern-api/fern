using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; init; }

    [JsonPropertyName("topStackFrame")]
    public StackFrame? TopStackFrame { get; init; }
}
