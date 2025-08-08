using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedExamples;

[Serializable]
public record Response : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("response")]
    public required object Response_ { get; set; }

    [JsonPropertyName("identifiers")]
    public IEnumerable<SeedExamples.Identifier> Identifiers { get; set; } =
        new List<SeedExamples.Identifier>();

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
