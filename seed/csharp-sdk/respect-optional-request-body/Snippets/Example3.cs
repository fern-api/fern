using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.RequiredRefundAsync(
            new RequiredRefundRequest {
                Id = "id",
                Body = new RefundRequest {
                    Amount = 1.1
                }
            }
        );
    }

}
