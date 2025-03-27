using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

public record ReceiveEvent3
{
    [JsonPropertyName("receiveText3")]
    public required string ReceiveText3 { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
