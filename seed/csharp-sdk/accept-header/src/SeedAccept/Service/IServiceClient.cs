namespace SeedAccept;

public partial interface IServiceClient
{
    Task EndpointAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
