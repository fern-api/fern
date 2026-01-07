using SeedExhaustive;

namespace SeedExhaustive.Endpoints;

public partial interface IPutClient
{
    Task<PutResponse> AddAsync(
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
