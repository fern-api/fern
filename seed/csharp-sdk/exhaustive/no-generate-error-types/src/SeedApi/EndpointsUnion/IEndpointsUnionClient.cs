using OneOf;

namespace SeedApi;

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
