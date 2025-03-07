using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

public record NestedUser
{
    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("NestedUser")]
    public required User NestedUser_ { get; set; }

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
