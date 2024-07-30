using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GenericValue
{
    [JsonPropertyName("stringifiedType")]
    public string? StringifiedType { get; set; }

    [JsonPropertyName("stringifiedValue")]
    public required string StringifiedValue { get; set; }
}
