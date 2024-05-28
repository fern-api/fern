using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class MapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<KeyValuePair> KeyValuePairs { get; init; }
}
