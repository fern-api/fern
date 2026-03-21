using SeedWebsocketOauth;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedWebsocketOauthClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            tenantName: "<Tenant-Name>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "client_credentials"
            }
        );
    }

}
