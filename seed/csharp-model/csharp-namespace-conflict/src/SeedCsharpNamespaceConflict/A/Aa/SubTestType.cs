using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.A.Aa;

[Serializable]
public record SubTestType : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("a")]
    public required A A { get; set; }

    [JsonPropertyName("b")]
    public required B B { get; set; }

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
