using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record TypesPropertyCollisionBaseParent : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// This inherited property collides with the default nested class name "Types"
    /// </summary>
    [JsonPropertyName("types")]
    public required string Types { get; set; }

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
