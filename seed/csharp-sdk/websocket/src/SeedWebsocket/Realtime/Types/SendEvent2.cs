using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

[Serializable]
public record SendEvent2
{
    [JsonPropertyName("sendText2")]
    public required string SendText2 { get; set; }

    [JsonPropertyName("sendParam2")]
    public required bool SendParam2 { get; set; }

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
