namespace SeedLiteral;

public partial interface IHeadersClient
{
    Task<SendResponse> SendAsync(
        SendLiteralsInHeadersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
