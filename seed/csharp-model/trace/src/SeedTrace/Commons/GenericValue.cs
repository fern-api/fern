using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class GenericValue
{
    [JsonPropertyName("stringifiedType")]
    public string? StringifiedType { get; init; }

    [JsonPropertyName("stringifiedValue")]
    public string StringifiedValue { get; init; }
}
