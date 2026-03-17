using SeedIdempotencyHeaders;

namespace Usage;

public class Example0
{
    public async Task Do() {
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
