using System.Text.Json.Serialization;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Types;

public record NestedObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public required string String { get; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; }
}
