using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public required object Key { get; }

    [JsonPropertyName("value")]
    public required object Value { get; }
}
