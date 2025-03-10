using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCsharpAccess.Core;

namespace SeedCsharpAccess;

public record User
{
    [JsonPropertyName("id")]
    [JsonAccess(JsonAccessType.ReadOnly)]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("password")]
    [JsonAccess(JsonAccessType.WriteOnly)]
    public required string Password { get; set; }

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
