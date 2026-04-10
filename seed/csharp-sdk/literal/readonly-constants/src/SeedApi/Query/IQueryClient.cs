namespace SeedApi;

public partial interface IQueryClient
{
    WithRawResponseTask<SendResponse> SendAsync(
        QuerySendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
