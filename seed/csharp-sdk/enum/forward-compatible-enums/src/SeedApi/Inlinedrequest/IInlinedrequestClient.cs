namespace SeedApi;

public partial interface IInlinedrequestClient
{
    Task SendAsync(
        InlinedRequestSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
