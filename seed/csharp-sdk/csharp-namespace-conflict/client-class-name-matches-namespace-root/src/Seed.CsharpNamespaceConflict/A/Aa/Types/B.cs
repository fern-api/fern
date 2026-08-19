using global::Seed.CsharpNamespaceConflict;
using global::Seed.CsharpNamespaceConflict.Core;
using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace Seed.CsharpNamespaceConflict.A.Aa;

[Serializable]
public record B : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

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
