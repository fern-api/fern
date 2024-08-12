using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record NestedObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; set; }
}
