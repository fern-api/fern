namespace SeedApi;

public partial interface IAssetReportClient
{
    WithRawResponseTask<global::System.IO.Stream> GetPdfAsync(
        AssetReportPdfGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<AssetReportGetResponse> GetAsync(
        AssetReportPdfGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
