using SeedApi;

namespace SeedApi.EndpointsHttpMethods;

public partial interface IEndpointsHttpMethodsClient
{
    WithRawResponseTask<string> EndpointsHttpMethodsTestGetAsync(
        EndpointsHttpMethodsTestGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> EndpointsHttpMethodsTestPutAsync(
        EndpointsHttpMethodsTestPutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> EndpointsHttpMethodsTestDeleteAsync(
        EndpointsHttpMethodsTestDeleteRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> EndpointsHttpMethodsTestPatchAsync(
        EndpointsHttpMethodsTestPatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> EndpointsHttpMethodsTestPostAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
