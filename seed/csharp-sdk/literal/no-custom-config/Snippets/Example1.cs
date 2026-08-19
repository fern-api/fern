using SeedLiteral;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendAsync(
            new SendLiteralsInHeadersRequest {
                EndpointVersion = "02-12-2024",
                Async = true,
                Query = "query"
            }
        );
    }

}
