namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask RefundAsync(
        RefundBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask RequiredRefundAsync(
        RequiredRefundRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask BulkRefundAsync(
        RefundRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
