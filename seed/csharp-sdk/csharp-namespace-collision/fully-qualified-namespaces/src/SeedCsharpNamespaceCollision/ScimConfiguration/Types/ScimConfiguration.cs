using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCsharpNamespaceCollision.Core;

namespace SeedCsharpNamespaceCollision.ScimConfiguration;

[Serializable]
public record ScimConfiguration : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("connectionId")]
    public required string ConnectionId { get; set; }

    [JsonPropertyName("connectionName")]
    public required string ConnectionName { get; set; }

    [JsonPropertyName("strategy")]
    public required string Strategy { get; set; }

    [JsonPropertyName("tenant")]
    public required string Tenant { get; set; }

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
