using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record NestedObjectWithLiterals
{
    [JsonPropertyName("literal1")]
    public string Literal1 { get; set; } = "literal1";

    [JsonPropertyName("literal2")]
    public string Literal2 { get; set; } = "literal2";

    [JsonPropertyName("strProp")]
    public required string StrProp { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
