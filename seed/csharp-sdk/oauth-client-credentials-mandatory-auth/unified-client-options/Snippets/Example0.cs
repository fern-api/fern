using SeedOauthClientCredentialsMandatoryAuth;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            clientOptions: new ClientOptions {
                ClientId = "<clientId>",
                ClientSecret = "<clientSecret>",
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
