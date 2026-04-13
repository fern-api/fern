using OneOf;

namespace SeedApi;

public partial interface IServiceClient
{
    WithRawResponseTask<OneOf<ResourceZero, ResourceOne>> GetresourceAsync(
        ServiceGetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<OneOf<ResourceZero, ResourceOne>>> ListresourcesAsync(
        ServiceListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
