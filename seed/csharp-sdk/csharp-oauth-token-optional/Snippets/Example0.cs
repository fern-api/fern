using SeedCsharpOauthTokenOptional;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpOauthTokenOptionalClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.CreateOauth2TokenAsync(
            new CreateOauth2TokenRequest {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                GrantType = "client_credentials"
            }
        );
    }

}
