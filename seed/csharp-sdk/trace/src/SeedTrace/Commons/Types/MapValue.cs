using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record MapValue
{
    [JsonPropertyName("keyValuePairs")]
    public IEnumerable<KeyValuePair> KeyValuePairs { get; set; } = new List<KeyValuePair>();
}
