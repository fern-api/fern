using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedExamples;

[Serializable]
public record Node : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("nodes")]
    public IEnumerable<SeedExamples.Node>? Nodes { get; set; }

    [JsonPropertyName("trees")]
    public IEnumerable<SeedExamples.Tree>? Trees { get; set; }

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
