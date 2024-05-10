using SeedIdempotencyHeaders;

namespace SeedIdempotencyHeaders;

public class CreatePaymentRequest
{
    public int Amount { get; init; }

    public Currency Currency { get; init; }
}
