using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[Serializable]
public record Request : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("union")]
    public OneOf<Dictionary<string, object?>?, NamedMetadata>? Union { get; set; }

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
