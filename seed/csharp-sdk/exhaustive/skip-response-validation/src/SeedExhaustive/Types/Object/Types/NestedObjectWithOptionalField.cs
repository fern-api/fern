using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public record NestedObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public string? String { get; set; }

    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField? NestedObject { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
