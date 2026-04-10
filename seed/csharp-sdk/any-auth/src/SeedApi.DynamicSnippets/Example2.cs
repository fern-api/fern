using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            apiKey: "<X-API-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetAsync();
    }

}
