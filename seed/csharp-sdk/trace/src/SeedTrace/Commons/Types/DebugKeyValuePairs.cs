using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public DebugVariableValue Key { get; init; }

    [JsonPropertyName("value")]
    public DebugVariableValue Value { get; init; }
}
