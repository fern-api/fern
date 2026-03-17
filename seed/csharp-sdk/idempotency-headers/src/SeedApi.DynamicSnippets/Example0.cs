using SeedIdempotencyHeaders;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedIdempotencyHeadersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            },
            token: "<token>"
        );

        await client.Payment.CreateAsync(
            new CreatePaymentRequest {
                Amount = 1,
                Currency = Currency.Usd
            }
        );
    }

}
