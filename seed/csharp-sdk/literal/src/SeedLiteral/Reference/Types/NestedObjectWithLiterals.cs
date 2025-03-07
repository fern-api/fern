using System.Text.Json;
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

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
