using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class DebugMapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<DebugKeyValuePairs> KeyValuePairs { get; init; }
}
