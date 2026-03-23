using global::Seed.CsharpNamespaceConflict;
using global::Seed.CsharpNamespaceConflict.Core;
using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace Seed.CsharpNamespaceConflict.B;

[Serializable]
public record TestType : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("a")]
    public required global::Seed.CsharpNamespaceConflict.A.Aa.A A { get; set; }

    [JsonPropertyName("b")]
    public required global::Seed.CsharpNamespaceConflict.A.Aa.B B { get; set; }

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
