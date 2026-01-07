namespace SeedIdempotencyHeaders;

public partial interface ISeedIdempotencyHeadersClient
{
    public PaymentClient Payment { get; }
}
