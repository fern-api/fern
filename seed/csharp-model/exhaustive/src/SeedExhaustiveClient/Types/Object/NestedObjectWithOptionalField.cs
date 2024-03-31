using System.Text.Json.Serialization;
using SeedExhaustiveClient.Types;

namespace SeedExhaustiveClient.Types;

public class NestedObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public string? String { get; init; }

    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField? NestedObject { get; init; }
}
