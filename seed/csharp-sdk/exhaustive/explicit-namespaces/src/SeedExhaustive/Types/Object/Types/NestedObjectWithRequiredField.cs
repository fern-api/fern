using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types.Object;

public record NestedObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; set; }
}
