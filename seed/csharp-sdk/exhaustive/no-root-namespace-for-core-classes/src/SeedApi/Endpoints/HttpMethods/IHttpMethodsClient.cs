using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial interface IHttpMethodsClient
{
    WithRawResponseTask<string> HttpMethodsTestGetAsync(
        HttpMethodsTestGetHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> HttpMethodsTestPutAsync(
        HttpMethodsTestPutHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> HttpMethodsTestDeleteAsync(
        HttpMethodsTestDeleteHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> HttpMethodsTestPatchAsync(
        HttpMethodsTestPatchHttpMethodsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithOptionalField> HttpMethodsTestPostAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
