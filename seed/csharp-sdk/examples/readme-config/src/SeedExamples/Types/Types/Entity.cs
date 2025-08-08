using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;

namespace SeedExamples;

[Serializable]
public record Entity : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("type")]
    public required OneOf<SeedExamples.BasicType, SeedExamples.ComplexType> Type { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

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
