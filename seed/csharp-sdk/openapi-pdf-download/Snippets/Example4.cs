using SeedApi;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.AssetReport.GetAsync(
            new AssetReportPdfGetRequest {
                AssetReportToken = "asset_report_token"
            }
        );
    }

}
