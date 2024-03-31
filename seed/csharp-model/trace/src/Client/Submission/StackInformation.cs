using System.Text.Json.Serialization;
using Client;

namespace Client;

public class StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public int NumStackFrames { get; init; }

    [JsonPropertyName("topStackFrame")]
    public StackFrame? TopStackFrame { get; init; }
}
