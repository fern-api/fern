using SeedApi;

namespace SeedApi.Endpoints;

public partial interface IContentTypeClient
{
    Task ContentTypePostJsonPatchContentTypeAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task ContentTypePostJsonPatchContentWithCharsetTypeAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
