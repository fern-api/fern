using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public object Key { get; init; }

    [JsonPropertyName("value")]
    public object Value { get; init; }
}
