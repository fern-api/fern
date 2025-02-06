using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; set; }

    [JsonPropertyName("topStackFrame")]
    public StackFrame? TopStackFrame { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
