namespace SeedApi;

public partial interface IPathparamClient
{
    Task SendAsync(
        PathParamSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
