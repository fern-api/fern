using System.Text.Json.Serialization;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.Types.Object;

public record NestedObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public string? String { get; set; }

    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField? NestedObject { get; set; }
}
