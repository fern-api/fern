using SeedLiteral;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendLiteralsOnlyAsync();
    }

}
