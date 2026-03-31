using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.ContentType;

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
