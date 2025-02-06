using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public required object Key { get; set; }

    [JsonPropertyName("value")]
    public required object Value { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
