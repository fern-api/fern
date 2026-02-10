namespace SeedIdempotencyHeaders;

public partial interface IPaymentClient
{
    WithRawResponseTask<string> CreateAsync(
        CreatePaymentRequest request,
        IdempotentRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task DeleteAsync(
        string paymentId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
