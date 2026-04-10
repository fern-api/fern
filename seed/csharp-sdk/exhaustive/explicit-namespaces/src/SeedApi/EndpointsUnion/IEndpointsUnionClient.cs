using OneOf;
using SeedApi;

namespace SeedApi.EndpointsUnion;

public partial interface IEndpointsUnionClient
{
    WithRawResponseTask<
        OneOf<TypesAnimalZero, TypesAnimalOne>
    > EndpointsUnionGetAndReturnUnionAsync(
        OneOf<TypesAnimalZero, TypesAnimalOne> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
