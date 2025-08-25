using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

[Serializable]
public record ReceiveEvent2 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("gamma")]
    public required string Gamma { get; set; }

    [JsonPropertyName("delta")]
    public required int Delta { get; set; }

    [JsonPropertyName("epsilon")]
    public required bool Epsilon { get; set; }

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
