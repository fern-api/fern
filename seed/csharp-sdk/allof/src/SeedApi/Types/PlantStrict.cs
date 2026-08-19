using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record PlantStrict : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The botanical species name.
    /// </summary>
    [JsonPropertyName("species")]
    public required string Species { get; set; }

    /// <summary>
    /// The botanical family.
    /// </summary>
    [JsonPropertyName("family")]
    public required string Family { get; set; }

    /// <summary>
    /// The botanical genus.
    /// </summary>
    [JsonPropertyName("genus")]
    public required string Genus { get; set; }

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
