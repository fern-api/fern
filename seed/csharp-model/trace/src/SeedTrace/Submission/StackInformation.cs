using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StackInformation
{
    [JsonPropertyName("numStackFrames")]
    public required int NumStackFrames { get; set; }

    [JsonPropertyName("topStackFrame")]
    public StackFrame? TopStackFrame { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
