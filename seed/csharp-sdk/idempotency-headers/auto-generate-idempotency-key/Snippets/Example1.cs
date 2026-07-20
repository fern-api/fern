using SeedIdempotencyHeaders;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedIdempotencyHeadersClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Payment.DeleteAsync(
            "paymentId"
        );
    }

}
