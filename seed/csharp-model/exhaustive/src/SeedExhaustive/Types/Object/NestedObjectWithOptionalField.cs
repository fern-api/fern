using System.Text.Json.Serialization;
using SeedExhaustive.Types;

namespace SeedExhaustive.Types;

public class NestedObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public List<string?> String { get; init; }

    [JsonPropertyName("NestedObject")]
    public List<ObjectWithOptionalField?> NestedObject { get; init; }
}
