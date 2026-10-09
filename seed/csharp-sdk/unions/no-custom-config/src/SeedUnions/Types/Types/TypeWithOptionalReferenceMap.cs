using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[Serializable]
public record TypeWithOptionalReferenceMap : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("references")]
    public Dictionary<string, Foo> References { get; set; } = new Dictionary<string, Foo>();

    [JsonPropertyName("metadata")]
    public Dictionary<string, object?> Metadata { get; set; } = new Dictionary<string, object?>();

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
