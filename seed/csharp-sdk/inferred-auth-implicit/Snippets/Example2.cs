using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedInferredAuthImplicitClient(
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
                ApiKey = "X-Api-Key",
                ClientId = "client_id",
                ClientSecret = "client_secret",
                RefreshToken = "refresh_token",
                Audience = AuthRefreshTokenRequestAudience.HttpsApiExampleCom,
                GrantType = AuthRefreshTokenRequestGrantType.RefreshToken
            }
        );
    }

}
