using SeedExhaustive;
using SeedExhaustive.Types.Union;

namespace SeedExhaustive.Endpoints.Union;

public partial interface IUnionClient
{
    WithRawResponseTask<Animal> GetAndReturnUnionAsync(
        Animal request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
