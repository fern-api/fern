namespace SeedFileDownload;

public partial interface IServiceClient
{
    Task SimpleAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);

    WithRawResponseTask<global::System.IO.Stream> DownloadFileAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
