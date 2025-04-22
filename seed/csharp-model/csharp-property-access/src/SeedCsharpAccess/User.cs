using SeedCsharpAccess.Core;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace SeedCsharpAccess;

public record User
{
    [JsonAccess(JsonAccessType.ReadOnly)][JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonAccess(JsonAccessType.WriteOnly)][JsonPropertyName("password")]
    public required string Password { get; set; }

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
