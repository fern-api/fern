using SeedApi;

namespace SeedApi.Endpoints;

public partial interface IPutClient
{
    WithRawResponseTask<EndpointsPutResponse> AddAsync(
        AddPutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
