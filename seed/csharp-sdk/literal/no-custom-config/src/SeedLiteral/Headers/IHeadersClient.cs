namespace SeedLiteral;

public partial interface IHeadersClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        SendLiteralsInHeadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<SendResponse> SendLiteralsOnlyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
