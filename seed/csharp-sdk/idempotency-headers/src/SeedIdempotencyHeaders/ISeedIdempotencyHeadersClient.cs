namespace SeedIdempotencyHeaders;

public partial interface ISeedIdempotencyHeadersClient
{
    public IPaymentClient Payment { get; }
}
