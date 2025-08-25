using global::System.Threading.Tasks;
using SeedOauthClientCredentialsDefault;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedOauthClientCredentialsDefaultClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest{
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "client_credentials"
            }
        );
    }

}
