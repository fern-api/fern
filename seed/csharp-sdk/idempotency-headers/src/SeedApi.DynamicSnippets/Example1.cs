using SeedIdempotencyHeaders;

namespace Usage;

public class Example1
{
    public async Task Do() {
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
