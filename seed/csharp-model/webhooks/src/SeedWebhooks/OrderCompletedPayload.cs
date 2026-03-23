using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebhooks.Core;

namespace SeedWebhooks;

[Serializable]
public record OrderCompletedPayload : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("orderId")]
    public required string OrderId { get; set; }

    [JsonPropertyName("total")]
    public required double Total { get; set; }

    [JsonPropertyName("currency")]
    public required string Currency { get; set; }

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
