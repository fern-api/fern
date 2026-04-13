namespace SeedApi;

public partial interface IServiceClient
{
    Task SimpleAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);

    WithRawResponseTask<global::System.IO.Stream> DownloadAsync(
        ServiceDownloadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
