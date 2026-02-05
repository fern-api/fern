namespace SeedBytesDownload;

public partial interface IServiceClient
{
    Task SimpleAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);

    Task DownloadAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
