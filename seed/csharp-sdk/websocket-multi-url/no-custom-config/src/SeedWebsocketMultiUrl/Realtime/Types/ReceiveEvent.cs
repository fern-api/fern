using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketMultiUrl.Core;

namespace SeedWebsocketMultiUrl;

[Serializable]
public record ReceiveEvent : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("data")]
    public required string Data { get; set; }

    [JsonPropertyName("timestamp")]
    public required int Timestamp { get; set; }

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
