namespace SeedApi;

public partial interface IInlinedClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        InlinedSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
