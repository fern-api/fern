using SeedOauthClientCredentialsDefault;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsDefaultClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
