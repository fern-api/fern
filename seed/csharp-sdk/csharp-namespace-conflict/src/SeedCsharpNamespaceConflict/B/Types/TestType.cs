using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.B;

[Serializable]
public record TestType : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("a")]
    public required A.Aa.A A { get; set; }

    [JsonPropertyName("b")]
    public required A.Aa.B B { get; set; }

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
