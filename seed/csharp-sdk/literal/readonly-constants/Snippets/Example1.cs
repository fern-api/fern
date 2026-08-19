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
                Query = "query"
            }
        );
    }

}
