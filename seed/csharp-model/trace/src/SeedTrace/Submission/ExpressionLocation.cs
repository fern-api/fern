using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record ExpressionLocation : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("start")]
    public required int Start { get; set; }

    [JsonPropertyName("offset")]
    public required int Offset { get; set; }

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
