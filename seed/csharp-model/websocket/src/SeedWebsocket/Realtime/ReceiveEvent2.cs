using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

public record ReceiveEvent2
{
    [JsonPropertyName("gamma")]
    public required string Gamma { get; set; }

    [JsonPropertyName("delta")]
    public required int Delta { get; set; }

    [JsonPropertyName("epsilon")]
    public required bool Epsilon { get; set; }

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
