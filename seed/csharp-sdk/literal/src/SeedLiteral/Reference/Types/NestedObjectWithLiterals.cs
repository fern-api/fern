using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record NestedObjectWithLiterals
{
    [JsonPropertyName("literal1")]
    public required string Literal1 { get; set; }

    [JsonPropertyName("literal2")]
    public required string Literal2 { get; set; }

    [JsonPropertyName("strProp")]
    public required string StrProp { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
