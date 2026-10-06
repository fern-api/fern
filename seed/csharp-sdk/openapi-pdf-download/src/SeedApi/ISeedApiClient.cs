namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAssetReportClient AssetReport { get; }
}
