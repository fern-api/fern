namespace SeedMixedCase;

public partial interface IServiceClient
{
    WithRawResponseTask<Resource> GetResourceAsync(
        string resourceId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
