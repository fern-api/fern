using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnionWithResponseProperty.Core;

namespace SeedUndiscriminatedUnionWithResponseProperty;

[Serializable]
public record VariantA : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("type")]
    public string Type { get; set; } = "A";

    [JsonPropertyName("valueA")]
    public required string ValueA { get; set; }

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
