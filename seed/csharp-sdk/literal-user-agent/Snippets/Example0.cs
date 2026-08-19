using SeedLiteralUserAgent;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedLiteralUserAgentClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PingAsync();
    }

}
