using System.Text.Json.Serialization;
using Client;

namespace Client;

public class MapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<KeyValuePair> KeyValuePairs { get; init; }
}
