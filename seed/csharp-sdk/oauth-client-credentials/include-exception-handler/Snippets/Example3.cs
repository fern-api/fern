using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshtokenAsync(
            new AuthRefreshTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                RefreshToken = "refresh_token",
                Audience = AuthRefreshTokenRequestAudience.HttpsApiExampleCom,
                GrantType = AuthRefreshTokenRequestGrantType.RefreshToken,
                Scope = "scope"
            }
        );
    }

}
