using SeedLiteral;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendAsync(
            new SendLiteralsInHeadersRequest {
                EndpointVersion = "02-12-2024",
                Async = true,
                Query = "What is the weather today"
            }
        );
    }

}
