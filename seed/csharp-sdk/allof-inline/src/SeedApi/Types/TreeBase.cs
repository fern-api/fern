using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record TreeBase : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Unique tree identifier.
    /// </summary>
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// Display name of the tree.
    /// </summary>
    [JsonPropertyName("treeName")]
    public string? TreeName { get; set; }

    /// <summary>
    /// A description of the tree.
    /// </summary>
    [JsonPropertyName("treeDescription")]
    public string? TreeDescription { get; set; }

    /// <summary>
    /// The species of tree.
    /// </summary>
    [JsonPropertyName("treeSpecies")]
    public string? TreeSpecies { get; set; }

    /// <summary>
    /// Height of the tree in feet.
    /// </summary>
    [JsonPropertyName("heightInFeet")]
    public double? HeightInFeet { get; set; }

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
