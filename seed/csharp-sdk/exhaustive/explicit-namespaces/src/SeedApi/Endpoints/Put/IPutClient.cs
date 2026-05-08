using SeedApi;

namespace SeedApi.Endpoints.Put;

public partial interface IPutClient
{
    WithRawResponseTask<EndpointsPutResponse> AddAsync(
        AddPutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
