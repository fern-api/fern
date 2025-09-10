using System.Text.Json.Serialization;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

[Serializable]
public record CreatePaymentRequest
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
