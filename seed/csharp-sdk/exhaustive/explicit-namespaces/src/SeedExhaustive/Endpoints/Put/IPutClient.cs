using SeedExhaustive;

namespace SeedExhaustive.Endpoints.Put;

public partial interface IPutClient
{
    Task<PutResponse> AddAsync(
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
