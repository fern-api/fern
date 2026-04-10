namespace SeedApi;

public partial interface IEndpointsUnionClient
{
    WithRawResponseTask<TypesAnimal> EndpointsUnionGetAndReturnUnionAsync(
        TypesAnimal request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
