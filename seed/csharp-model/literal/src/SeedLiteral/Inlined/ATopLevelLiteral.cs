using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record ATopLevelLiteral
{
    [JsonPropertyName("nestedLiteral")]
    public required ANestedLiteral NestedLiteral { get; set; }

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
