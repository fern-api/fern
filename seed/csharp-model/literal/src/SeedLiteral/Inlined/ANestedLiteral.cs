using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record ANestedLiteral
{
    [JsonPropertyName("myLiteral")]
    public string MyLiteral { get; set; } = "How super cool";

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
