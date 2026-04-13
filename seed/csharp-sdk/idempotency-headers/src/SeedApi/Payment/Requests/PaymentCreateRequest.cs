using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record PaymentCreateRequest
{
    [JsonPropertyName("amount")]
    public required int Amount { get; set; }

    [JsonPropertyName("currency")]
    public required Currency Currency { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
