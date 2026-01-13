using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IContentTypeClient
{
    Task PostJsonPatchContentTypeAsync(
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task PostJsonPatchContentWithCharsetTypeAsync(
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
