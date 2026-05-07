using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial interface IPutClient
{
    WithRawResponseTask<EndpointsPutResponse> EndpointsPutAddAsync(
        EndpointsPutAddPutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
