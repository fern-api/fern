using System.Text.Json;
using System.Text.Json.Serialization;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

public record WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();

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
