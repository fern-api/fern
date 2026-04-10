namespace SeedApi;

public partial interface IHeadersClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        HeadersSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
