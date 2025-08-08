using System.Threading.Tasks;
using SeedOauthClientCredentialsEnvironmentVariables;

namespace Usage;

public class Example0
{
    public async Task Do()
    {
        var client = new SeedOauthClientCredentialsEnvironmentVariablesClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest
            {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Scope = "scope"
            }
        );
    }

}
