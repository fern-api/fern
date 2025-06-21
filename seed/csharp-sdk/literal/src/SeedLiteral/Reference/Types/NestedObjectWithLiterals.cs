using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
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
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
