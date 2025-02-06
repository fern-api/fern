using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record MapType
{
    [JsonPropertyName("keyType")]
    public required object KeyType { get; set; }

    [JsonPropertyName("valueType")]
    public required object ValueType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
