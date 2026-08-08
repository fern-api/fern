using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.RequiredRefundAsync(
            new RequiredRefundRequest {
                Id = "refund-id",
                Body = new RefundRequest {
                    Amount = 60
                }
            }
        );
    }

}
