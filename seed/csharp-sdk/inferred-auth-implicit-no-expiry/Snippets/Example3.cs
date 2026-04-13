using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedInferredAuthImplicitNoExpiryClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshtokenAsync(
            new AuthRefreshTokenRequest {
                ApiKey = "apiKey",
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
