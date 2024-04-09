using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class MapType
{
    [JsonPropertyName("keyType")]
    public VariableType KeyType { get; init; }

    [JsonPropertyName("valueType")]
    public VariableType ValueType { get; init; }
}
