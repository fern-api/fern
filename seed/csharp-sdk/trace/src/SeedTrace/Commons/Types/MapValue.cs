using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class MapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<KeyValuePair> KeyValuePairs { get; init; }
}
