using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Identity.GetTokenAsync(
            new GetTokenIdentityRequest {
                Username = "username",
                Password = "password"
            }
        );
    }

}
