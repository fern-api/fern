using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExtraProperties.Core;

namespace SeedExtraProperties;

public record CreateUserRequest
{
    [JsonPropertyName("_type")]
    public string Type { get; set; } = "CreateUserRequest";

    [JsonPropertyName("_version")]
    public string Version { get; set; } = "v1";

    [JsonPropertyName("name")]
    public required string Name { get; set; }

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
