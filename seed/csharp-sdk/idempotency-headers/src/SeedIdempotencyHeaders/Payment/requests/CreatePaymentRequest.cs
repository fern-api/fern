using System.Text.Json.Serialization;
using SeedIdempotencyHeaders.Core;
using SeedIdempotencyHeaders;

#nullable enable

namespace SeedIdempotencyHeaders;

public class CreatePaymentRequest
{
    [JsonPropertyName("amount")]
    public int Amount { get; init; }

    [JsonPropertyName("currency")JsonConverter(typeof(StringEnumSerializer;
    <Currency;
    >))]
    public Currency Currency { get; init; }
}
