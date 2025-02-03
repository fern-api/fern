using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DebugMapValue
{
    [JsonPropertyName("keyValuePairs")]
    public IEnumerable<DebugKeyValuePairs> KeyValuePairs { get; set; } =
        new List<DebugKeyValuePairs>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
