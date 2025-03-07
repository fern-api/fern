using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public record ObjectWithMapOfMap
{
    [JsonPropertyName("map")]
    public Dictionary<string, Dictionary<string, string>> Map { get; set; } =
        new Dictionary<string, Dictionary<string, string>>();

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
