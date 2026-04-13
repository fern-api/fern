using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedInferredAuthImplicitClient(
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshtokenAsync(
            new RefreshTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                RefreshToken = "refresh_token",
                Audience = RefreshTokenRequestAudience.HttpsApiExampleCom,
                GrantType = RefreshTokenRequestGrantType.RefreshToken,
                Scope = "scope"
            }
        );
    }

}
