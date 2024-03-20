using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public int NumStackFrames { get; init; }

    [JsonPropertyName("topStackFrame")]
    public StackFrame? TopStackFrame { get; init; }
}
