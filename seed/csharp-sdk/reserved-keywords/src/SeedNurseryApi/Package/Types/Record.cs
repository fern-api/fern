using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

[Serializable]
public record Record : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("foo")]
    public Dictionary<string, string> Foo { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("3d")]
    public required int _3D { get; set; }

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
