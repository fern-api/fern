using System.Text.Json.Serialization;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public record ATopLevelLiteral
{
    [JsonPropertyName("nestedLiteral")]
    public required ANestedLiteral NestedLiteral { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
