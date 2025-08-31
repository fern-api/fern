using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

[Serializable]
public record SendEvent2 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("sendText2")]
    public required string SendText2 { get; set; }

    [JsonPropertyName("sendParam2")]
    public required bool SendParam2 { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
