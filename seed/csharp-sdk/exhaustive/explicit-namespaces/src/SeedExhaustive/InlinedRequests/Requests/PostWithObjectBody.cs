using System.Text.Json.Serialization;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.InlinedRequests;

public record PostWithObjectBody
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonPropertyName("integer")]
    public required int Integer { get; set; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; set; }
}
