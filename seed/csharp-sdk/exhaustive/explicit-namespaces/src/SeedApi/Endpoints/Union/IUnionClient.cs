using OneOf;
using SeedApi;

namespace SeedApi.Endpoints.Union;

public partial interface IUnionClient
{
    WithRawResponseTask<OneOf<TypesAnimalZero, TypesAnimalOne>> GetAndReturnUnionAsync(
        OneOf<TypesAnimalZero, TypesAnimalOne> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
