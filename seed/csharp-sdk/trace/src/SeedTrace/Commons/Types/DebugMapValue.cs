using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record DebugMapValue
{
    [JsonPropertyName("keyValuePairs")]
    public IEnumerable<DebugKeyValuePairs> KeyValuePairs { get; set; } =
        new List<DebugKeyValuePairs>();
}
