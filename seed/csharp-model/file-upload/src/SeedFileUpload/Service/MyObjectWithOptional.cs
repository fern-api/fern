using System.Text.Json;
using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record MyObjectWithOptional : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("prop")]
    public required string Prop { get; set; }

    [JsonPropertyName("optionalProp")]
    public string? OptionalProp { get; set; }

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
