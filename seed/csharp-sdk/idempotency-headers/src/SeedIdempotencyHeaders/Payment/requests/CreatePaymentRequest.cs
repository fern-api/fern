using System.Text.Json.Serialization;
using SeedIdempotencyHeaders;

namespace SeedIdempotencyHeaders;

public class CreatePaymentRequest
{
    [JsonPropertyName("amount")]
    public int Amount { get; init; }

    [JsonPropertyName("currency")]
    public Currency Currency { get; init; }
}
