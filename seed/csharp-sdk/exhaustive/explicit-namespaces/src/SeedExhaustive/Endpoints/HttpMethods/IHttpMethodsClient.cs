using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.HttpMethods;

public partial interface IHttpMethodsClient
{
    WithRawResponseTask<string> TestGetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ObjectWithOptionalField> TestPostAsync(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ObjectWithOptionalField> TestPutAsync(
        string id,
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ObjectWithOptionalField> TestPatchAsync(
        string id,
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> TestDeleteAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
