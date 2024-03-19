using System.Text.Json.Serialization

namespace SeedTraceClient

public class GenericValue
{
    [JsonPropertyName("stringifiedType")]
    public string? StringifiedType { get; init; }
    [JsonPropertyName("stringifiedValue")]
    public string StringifiedValue { get; init; }
}
