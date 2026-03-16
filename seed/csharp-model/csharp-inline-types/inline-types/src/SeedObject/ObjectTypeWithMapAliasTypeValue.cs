using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record ObjectTypeWithMapAliasTypeValue : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("prop")]
    public Dictionary<string, Types.AliasPropertyType> Prop { get; set; } =
        new Dictionary<string, Types.AliasPropertyType>();

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
