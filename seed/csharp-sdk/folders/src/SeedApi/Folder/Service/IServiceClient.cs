using SeedApi;

namespace SeedApi.Folder;

public partial interface IServiceClient
{
    Task EndpointAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task UnknownRequestAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
