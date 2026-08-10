using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BulkRefundAsync(
            new RefundRequest {
                Amount = 1.1
            }
        );
    }

}
