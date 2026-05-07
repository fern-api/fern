using SeedApi;

namespace SeedApi.Endpoints.Put;

public partial interface IPutClient
{
    WithRawResponseTask<EndpointsPutResponse> EndpointsPutAddAsync(
        EndpointsPutAddPutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
