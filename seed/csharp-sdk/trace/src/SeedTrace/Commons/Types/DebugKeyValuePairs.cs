using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public DebugVariableValue Key { get; init; }

    [JsonPropertyName("value")]
    public DebugVariableValue Value { get; init; }
}
