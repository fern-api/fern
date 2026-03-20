using SeedWebsocketOauth;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedWebsocketOauthClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            tenantName: "<Tenant-Name>"
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = "https://api.example.com",
                GrantType = "client_credentials",
                Scope = "scope"
            }
        );
    }

}
