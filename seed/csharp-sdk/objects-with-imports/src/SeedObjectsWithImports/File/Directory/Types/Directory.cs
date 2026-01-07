using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.File_;

[Serializable]
public record Directory : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [Optional]
    [JsonPropertyName("files")]
    public IEnumerable<SeedObjectsWithImports.File>? Files { get; set; }

    [Optional]
    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; set; }

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
