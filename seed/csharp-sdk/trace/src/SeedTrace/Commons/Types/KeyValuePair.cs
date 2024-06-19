using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class KeyValuePair
{
    [JsonPropertyName("key")]
    public VariableValue Key { get; init; }

    [JsonPropertyName("value")]
    public VariableValue Value { get; init; }
}
