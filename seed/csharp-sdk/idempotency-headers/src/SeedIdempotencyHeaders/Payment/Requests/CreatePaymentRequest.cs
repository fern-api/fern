using System.Text.Json.Serialization;
using SeedIdempotencyHeaders;

#nullable enable

namespace SeedIdempotencyHeaders;

public record CreatePaymentRequest
{
    [JsonPropertyName("amount")]
    public required int Amount { get; init; }

    [JsonPropertyName("currency")]
    public required Currency Currency { get; init; }
}
