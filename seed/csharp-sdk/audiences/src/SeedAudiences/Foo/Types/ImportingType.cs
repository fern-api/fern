using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences;

public record ImportingType
{
    [JsonPropertyName("imported")]
    public required string Imported { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
