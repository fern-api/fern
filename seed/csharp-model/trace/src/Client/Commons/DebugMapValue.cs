using System.Text.Json.Serialization;
using Client;

namespace Client;

public class DebugMapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<DebugKeyValuePairs> KeyValuePairs { get; init; }
}
