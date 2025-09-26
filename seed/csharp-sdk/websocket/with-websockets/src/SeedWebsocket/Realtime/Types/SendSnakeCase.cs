using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocket.Core;

namespace SeedWebsocket;

[Serializable]
public record SendSnakeCase : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("send_text")]
    public required string SendText { get; set; }

    [JsonPropertyName("send_param")]
    public required int SendParam { get; set; }

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
