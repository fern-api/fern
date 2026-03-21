using SeedWebsocketOauth;

namespace Usage;

public class Example0
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
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                GrantType = "client_credentials"
            }
        );
    }

}
