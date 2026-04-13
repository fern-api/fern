using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedIdempotencyHeadersClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Payment.CreateAsync(
            new PaymentCreateRequest {
                Amount = 1,
                Currency = Currency.Usd
            }
        );
    }

}
