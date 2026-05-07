using SeedApi;

namespace SeedApi.Endpoints;

public partial interface IUnionClient
{
    WithRawResponseTask<TypesAnimal> GetAndReturnUnionAsync(
        TypesAnimal request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
