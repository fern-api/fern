using System.Text.Json.Serialization;
using System.Text.Json;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.B;

public record TestType
{
    [JsonPropertyName("a")]
    public required A.Aa.A A { get; set; }

    [JsonPropertyName("b")]
    public required A.Aa.B B { get; set; }

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
