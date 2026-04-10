namespace SeedApi;

public partial interface IServiceClient
{
    Task SimpleAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);

    WithRawResponseTask<global::System.IO.Stream> DownloadfileAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
