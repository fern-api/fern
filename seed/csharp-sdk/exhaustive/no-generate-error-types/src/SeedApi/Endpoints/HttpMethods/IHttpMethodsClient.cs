using SeedApi;

namespace SeedApi.Endpoints;

public partial interface IHttpMethodsClient
{
    WithRawResponseTask<string> TestGetAsync(
        TestGetHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> TestPutAsync(
        TestPutHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> TestDeleteAsync(
        TestDeleteHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> TestPatchAsync(
        TestPatchHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> TestPostAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
