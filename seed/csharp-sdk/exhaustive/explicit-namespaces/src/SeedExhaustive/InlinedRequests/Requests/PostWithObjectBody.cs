using System.Text.Json.Serialization;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.InlinedRequests;

[System.Serializable]
public record PostWithObjectBody
{
    [System.Text.Json.Serialization.JsonPropertyName("string")]
    public required string String { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("integer")]
    public required int Integer { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("NestedObject")]
    public required SeedExhaustive.Types.Object.ObjectWithOptionalField NestedObject { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
