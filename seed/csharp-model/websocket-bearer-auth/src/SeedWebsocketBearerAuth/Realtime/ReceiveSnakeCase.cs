using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

[Serializable]
public record ReceiveSnakeCase : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("receive_text")]
    public required string ReceiveText { get; set; }

    [JsonPropertyName("receive_int")]
    public required int ReceiveInt { get; set; }

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
