using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedExamples;

[Serializable]
public record Directory : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("files")]
    public IEnumerable<SeedExamples.File>? Files { get; set; }

    [JsonPropertyName("directories")]
    public IEnumerable<SeedExamples.Directory>? Directories { get; set; }

    [JsonIgnore]
    public SeedExamples.ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } =
        new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExamples.Core.JsonUtils.Serialize(this);
    }
}
