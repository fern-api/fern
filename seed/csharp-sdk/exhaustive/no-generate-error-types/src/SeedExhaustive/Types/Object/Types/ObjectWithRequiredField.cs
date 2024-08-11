using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public required string String { get; set; }
}
