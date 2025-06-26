using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record BinaryTreeValue : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("root")]
    public string? Root { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, BinaryTreeNodeValue> Nodes { get; set; } =
        new Dictionary<string, BinaryTreeNodeValue>();

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
