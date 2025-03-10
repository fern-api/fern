using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences;

public record FindRequest
{
    [JsonIgnore]
    public string? OptionalString { get; set; }

    [JsonPropertyName("publicProperty")]
    public string? PublicProperty { get; set; }

    [JsonPropertyName("privateProperty")]
    public int? PrivateProperty { get; set; }

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
