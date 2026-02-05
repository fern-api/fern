using SeedOauthClientCredentialsReference;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsReferenceClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
