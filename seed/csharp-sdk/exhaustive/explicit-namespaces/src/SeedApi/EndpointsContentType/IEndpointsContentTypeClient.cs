using SeedApi;

namespace SeedApi.EndpointsContentType;

public partial interface IEndpointsContentTypeClient
{
    Task EndpointsContentTypePostJsonPatchContentTypeAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task EndpointsContentTypePostJsonPatchContentWithCharsetTypeAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
