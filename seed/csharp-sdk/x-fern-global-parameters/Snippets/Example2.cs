using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Products.GetAsync(
            new GetProductsRequest {
                RegionId = "regionId",
                ProductId = "productId"
            }
        );
    }

}
