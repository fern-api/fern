using SeedApi.Core;

namespace SeedApi;

public partial interface IEndpointsPutClient
{
    WithRawResponseTask<EndpointsPutResponse> EndpointsPutAddAsync(
        EndpointsPutAddRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
