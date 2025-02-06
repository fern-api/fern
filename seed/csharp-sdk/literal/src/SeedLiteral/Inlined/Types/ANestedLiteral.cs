using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record ANestedLiteral
{
    [JsonPropertyName("myLiteral")]
    public required string MyLiteral { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
