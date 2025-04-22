using System.Text.Json.Serialization;
using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public record ANestedLiteral
{
    [JsonPropertyName("myLiteral")]
    public string MyLiteral { get; set; } = "How super cool";

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
