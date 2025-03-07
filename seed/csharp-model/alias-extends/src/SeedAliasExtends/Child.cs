using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAliasExtends.Core;

namespace SeedAliasExtends;

public record Child
{
    [JsonPropertyName("child")]
    public required string Child_ { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }

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
