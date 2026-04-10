namespace SeedApi;

public partial interface IPathClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        PathSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
