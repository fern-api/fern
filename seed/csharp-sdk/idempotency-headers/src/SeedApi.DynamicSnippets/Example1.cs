using SeedIdempotencyHeaders;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedIdempotencyHeadersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            },
            token: "<token>"
        );

        await client.Payment.DeleteAsync(
            "paymentId"
        );
    }

}
