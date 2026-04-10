using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Tests that dynamic snippets recursively construct default objects for
/// required properties whose type is a named object. The nested object's
/// own required properties should also be filled with defaults.
/// </summary>
[Serializable]
public record TypesObjectWithRequiredNestedObject : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("requiredString")]
    public required string RequiredString { get; set; }

    [JsonPropertyName("requiredObject")]
    public required TypesNestedObjectWithRequiredField RequiredObject { get; set; }

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
