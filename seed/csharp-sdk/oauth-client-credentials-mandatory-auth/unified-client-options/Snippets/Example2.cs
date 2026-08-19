using SeedOauthClientCredentialsMandatoryAuth;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            clientOptions: new ClientOptions {
                ClientId = "<clientId>",
                ClientSecret = "<clientSecret>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshTokenAsync(
            new RefreshTokenRequest {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                RefreshToken = "refresh_token",
                Audience = "https://api.example.com",
                GrantType = "refresh_token",
                Scope = "read:users"
            }
        );
    }

}
