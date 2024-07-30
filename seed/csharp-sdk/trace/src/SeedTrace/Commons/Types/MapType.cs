using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record MapType
{
    [JsonPropertyName("keyType")]
    public required object KeyType { get; set; }

    [JsonPropertyName("valueType")]
    public required object ValueType { get; set; }
}
