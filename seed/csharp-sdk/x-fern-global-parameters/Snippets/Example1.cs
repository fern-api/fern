using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Products.SearchAsync(
            new SearchProductsRequest {
                RegionId = "regionId",
                Query = "query",
                Config = new SearchProductsRequestConfig {
                    Currency = "currency",
                    Limit = 1
                }
            }
        );
    }

}
