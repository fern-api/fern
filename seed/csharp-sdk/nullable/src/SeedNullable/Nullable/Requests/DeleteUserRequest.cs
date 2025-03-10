using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

public record DeleteUserRequest
{
    /// <summary>
    /// The user to delete.
    /// </summary>
    [JsonPropertyName("username")]
    public string? Username { get; set; }

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
