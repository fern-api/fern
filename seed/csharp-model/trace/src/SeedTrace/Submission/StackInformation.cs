using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public int NumStackFrames { get; init; }

    [JsonPropertyName("topStackFrame")]
    public List<StackFrame?> TopStackFrame { get; init; }
}
