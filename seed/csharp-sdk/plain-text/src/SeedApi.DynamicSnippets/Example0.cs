using SeedPlainText;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedPlainTextClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetTextAsync();
    }

}
