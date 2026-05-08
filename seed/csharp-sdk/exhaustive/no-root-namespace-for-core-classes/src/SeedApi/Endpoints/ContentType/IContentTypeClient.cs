using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial interface IContentTypeClient
{
    Task PostJsonPatchContentTypeAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task PostJsonPatchContentWithCharsetTypeAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
