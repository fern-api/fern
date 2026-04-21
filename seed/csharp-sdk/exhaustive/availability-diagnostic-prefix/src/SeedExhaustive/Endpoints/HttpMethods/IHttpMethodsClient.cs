using global::System.Diagnostics.CodeAnalysis;
using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IHttpMethodsClient
{
    WithRawResponseTask<string> TestGetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [global::System.Obsolete]
    WithRawResponseTask<ObjectWithOptionalField> TestPostAsync(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [global::System.Obsolete("Use testPatch instead.")]
    WithRawResponseTask<ObjectWithOptionalField> TestPutAsync(
        string id,
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [global::System.Diagnostics.CodeAnalysis.Experimental("ACME0002")]
    WithRawResponseTask<ObjectWithOptionalField> TestPatchAsync(
        string id,
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    [global::System.Diagnostics.CodeAnalysis.Experimental("ACME0001")]
    WithRawResponseTask<bool> TestDeleteAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
