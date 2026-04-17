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

    [Obsolete]
    WithRawResponseTask<ObjectWithOptionalField> TestPostAsync(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [Obsolete("Use testPatch instead.")]
    WithRawResponseTask<ObjectWithOptionalField> TestPutAsync(
        string id,
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// @beta This endpoint is in pre-release and may change.
    /// </summary>
    WithRawResponseTask<ObjectWithOptionalField> TestPatchAsync(
        string id,
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// @beta This endpoint is in development and may change.
    /// </summary>
    WithRawResponseTask<bool> TestDeleteAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
