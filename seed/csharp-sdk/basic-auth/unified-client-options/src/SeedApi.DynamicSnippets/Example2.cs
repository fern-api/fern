using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                Username = "<username>",
                Password = "<password>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Basicauth.GetwithbasicauthAsync();
    }

}
