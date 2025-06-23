using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[Serializable]
public record NestedUser : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("NestedUser")]
    public required User NestedUser_ { get; set; }

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
