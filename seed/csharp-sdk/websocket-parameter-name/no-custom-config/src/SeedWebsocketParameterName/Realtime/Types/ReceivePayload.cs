using System.Text.Json;
using System.Text.Json.Serialization;
using SeedWebsocketParameterName.Core;

namespace SeedWebsocketParameterName;

[Serializable]
public record ReceivePayload : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The response text
    /// </summary>
    [JsonPropertyName("response")]
    public required string Response { get; set; }

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
