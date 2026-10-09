namespace SeedBytesDownload;

public partial interface IServiceClient
{
    WithRawResponseTask SimpleAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task DownloadAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
