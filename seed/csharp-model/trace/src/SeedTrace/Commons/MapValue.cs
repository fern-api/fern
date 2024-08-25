using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record MapValue
{
    [JsonPropertyName("keyValuePairs")]
    public IEnumerable<KeyValuePair> KeyValuePairs { get; set; } = new List<KeyValuePair>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
