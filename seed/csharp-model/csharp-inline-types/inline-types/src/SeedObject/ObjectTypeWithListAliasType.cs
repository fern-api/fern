using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record ObjectTypeWithListAliasType : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("prop")]
    public IEnumerable<Types.AliasPropertyType> Prop { get; set; } =
        new List<Types.AliasPropertyType>();

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
