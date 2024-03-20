using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class MapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<KeyValuePair> KeyValuePairs { get; init; }
}
