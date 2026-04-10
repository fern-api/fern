using SeedOauthClientCredentials;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                Audience = "https://api.example.com",
                GrantType = "client_credentials",
                Scope = "read:users"
            }
        );
    }

}
