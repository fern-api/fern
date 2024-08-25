using System.Text.Json.Serialization;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Types;

public record NestedObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public string? String { get; }

    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField? NestedObject { get; }
}
