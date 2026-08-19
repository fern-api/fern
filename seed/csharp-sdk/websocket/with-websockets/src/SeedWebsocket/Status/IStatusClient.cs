namespace SeedWebsocket;

public partial interface IStatusClient
{
    WithRawResponseTask<StatusResponse> GetStatusAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
