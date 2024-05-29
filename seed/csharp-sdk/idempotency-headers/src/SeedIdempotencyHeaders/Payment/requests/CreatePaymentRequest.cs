using System.Text.Json.Serialization;
using SeedIdempotencyHeaders;
using SeedIdempotencyHeaders.Core;

#nullable enable

namespace SeedIdempotencyHeaders;

public class CreatePaymentRequest
{
    [JsonPropertyName("amount")]
    public int Amount { get; init; }

    [JsonPropertyName("currency")]
    [JsonConverter(typeof(StringEnumSerializer<Currency>))]
    public Currency Currency { get; init; }
}
