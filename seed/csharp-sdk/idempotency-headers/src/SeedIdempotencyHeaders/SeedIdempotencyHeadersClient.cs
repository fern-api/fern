using SeedIdempotencyHeaders;

namespace SeedIdempotencyHeaders;

public partial class SeedIdempotencyHeadersClient
{
    public SeedIdempotencyHeadersClient (string token){
    }
    public PaymentClient Payment { get; }
}
