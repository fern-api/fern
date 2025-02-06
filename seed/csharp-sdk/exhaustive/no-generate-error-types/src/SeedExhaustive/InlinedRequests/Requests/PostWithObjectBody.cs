using System.Text.Json.Serialization;
using SeedExhaustive.Types;
using SeedExhaustive.Core;

    namespace SeedExhaustive;

public record PostWithObjectBody
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonPropertyName("integer")]
    public required int Integer { get; set; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
