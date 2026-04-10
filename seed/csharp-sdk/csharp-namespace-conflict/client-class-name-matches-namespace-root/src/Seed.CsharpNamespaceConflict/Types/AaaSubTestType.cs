using global::Seed.CsharpNamespaceConflict.Core;
using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace Seed.CsharpNamespaceConflict;

[Serializable]
public record AaaSubTestType : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("a")]
    public required AaaA A { get; set; }

    [JsonPropertyName("b")]
    public required AaaB B { get; set; }

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
