using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAliasExtends.Core;

namespace SeedAliasExtends;

[Serializable]
public record Child
{
    [JsonPropertyName("child")]
    public required string Child_ { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }

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
