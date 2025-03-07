using global::System.Threading.Tasks;
using SeedOauthClientCredentialsEnvironmentVariables;
using SeedOauthClientCredentialsEnvironmentVariables.Core;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedOauthClientCredentialsEnvironmentVariablesClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshTokenAsync(
            new RefreshTokenRequest{
                ClientId = "client_id",
                ClientSecret = "client_secret",
                RefreshToken = "refresh_token",
                Scope = "scope"
            }
        );
    }

}
