using SeedIdempotencyHeaders;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedIdempotencyHeadersClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Payment.CreateAsync(
            new CreatePaymentRequest {
                Amount = 1,
                Currency = Currency.Usd
            }
        );
    }

}
