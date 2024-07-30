using System.Text.Json.Serialization;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive;

public record PostWithObjectBody
{
    [JsonPropertyName("string")]
    public required string String { get; }

    [JsonPropertyName("integer")]
    public required int Integer { get; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; }
}
