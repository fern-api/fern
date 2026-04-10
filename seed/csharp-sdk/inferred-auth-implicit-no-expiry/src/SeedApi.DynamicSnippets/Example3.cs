using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
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
