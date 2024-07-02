using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class MapType
{
    [JsonPropertyName("keyType")]
    public object KeyType { get; init; }

    [JsonPropertyName("valueType")]
    public object ValueType { get; init; }
}
