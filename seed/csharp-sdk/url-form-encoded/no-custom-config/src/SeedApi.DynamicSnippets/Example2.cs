using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetTokenAsync(
            new TokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
