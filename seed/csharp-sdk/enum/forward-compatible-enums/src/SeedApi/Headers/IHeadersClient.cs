namespace SeedApi;

public partial interface IHeadersClient
{
    Task SendAsync(
        HeadersSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
