namespace SeedApi;

public partial interface IQueryparamClient
{
    Task SendAsync(
        QueryParamSendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task SendlistAsync(
        QueryParamSendListRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
