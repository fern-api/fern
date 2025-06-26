using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record MapType : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("keyType")]
    public required VariableType KeyType { get; set; }

    [JsonPropertyName("valueType")]
    public required VariableType ValueType { get; set; }

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
