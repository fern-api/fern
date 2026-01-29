using SeedExhaustive;

namespace SeedExhaustive.Endpoints.Put;

public partial interface IPutClient
{
    WithRawResponseTask<PutResponse> AddAsync(
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
