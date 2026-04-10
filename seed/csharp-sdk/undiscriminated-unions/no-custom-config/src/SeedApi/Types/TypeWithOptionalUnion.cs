using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record TypeWithOptionalUnion : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("myUnion")]
    public OneOf<
        string,
        int,
        IEnumerable<int>,
        IEnumerable<IEnumerable<int>>,
        IEnumerable<string>
    >? MyUnion { get; set; }

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
