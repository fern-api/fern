namespace SeedApi;

public partial interface IFolderServiceClient
{
    Task FolderServiceEndpointAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task FolderServiceUnknownRequestAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
