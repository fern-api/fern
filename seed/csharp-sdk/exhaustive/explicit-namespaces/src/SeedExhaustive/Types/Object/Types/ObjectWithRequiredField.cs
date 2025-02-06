using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

public record ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
