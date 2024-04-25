using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class DebugMapValue
{
    [JsonPropertyName("keyValuePairs")]
    public List<List<DebugKeyValuePairs>> KeyValuePairs { get; init; }
}
