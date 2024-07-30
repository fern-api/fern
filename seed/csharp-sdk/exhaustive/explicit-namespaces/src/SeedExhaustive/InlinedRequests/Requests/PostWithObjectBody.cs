using System.Text.Json.Serialization;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.InlinedRequests;

public record PostWithObjectBody
{
    [JsonPropertyName("string")]
    public required string String { get; init; }

    [JsonPropertyName("integer")]
    public required int Integer { get; init; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; init; }
}
