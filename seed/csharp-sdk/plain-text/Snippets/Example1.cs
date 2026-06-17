using SeedPlainText;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedPlainTextClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetCsvAsync();
    }

}
