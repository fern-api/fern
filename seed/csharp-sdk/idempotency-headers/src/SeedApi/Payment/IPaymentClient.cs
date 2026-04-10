namespace SeedApi;

public partial interface IPaymentClient
{
    WithRawResponseTask<string> CreateAsync(
        PaymentCreateRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task DeleteAsync(
        PaymentDeleteRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
