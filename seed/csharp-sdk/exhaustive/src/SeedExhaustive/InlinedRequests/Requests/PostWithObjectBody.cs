using System.Text.Json.Serialization;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive;

public class PostWithObjectBody
{
    [JsonPropertyName("string")]
    public string String { get; init; }

    [JsonPropertyName("integer")]
    public int Integer { get; init; }

    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField NestedObject { get; init; }
}
