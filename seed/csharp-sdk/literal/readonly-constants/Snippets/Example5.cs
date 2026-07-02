using SeedLiteral;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Path.SendAsync(
            "123"
        );
    }

}
