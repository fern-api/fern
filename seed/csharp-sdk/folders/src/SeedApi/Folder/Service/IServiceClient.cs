using SeedApi;

namespace SeedApi.Folder;

public partial interface IServiceClient
{
    WithRawResponseTask EndpointAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask UnknownRequestAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
