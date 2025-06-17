using System.Text.Json;
using System.Text.Json.Serialization;
using SeedBasicAuth.Core;

namespace SeedBasicAuth;

[Serializable]
public record UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
