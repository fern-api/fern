namespace SeedMixedCase;

public partial interface IServiceClient
{
    Task<Resource> GetResourceAsync(
        string resourceId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
