using SeedLiteral;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendAsync(
            new SendLiteralsInHeadersRequest {
                Query = "What is the weather today"
            }
        );
    }

}
