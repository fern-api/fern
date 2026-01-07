using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IUnionClient
{
    Task<Animal> GetAndReturnUnionAsync(
        Animal request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
