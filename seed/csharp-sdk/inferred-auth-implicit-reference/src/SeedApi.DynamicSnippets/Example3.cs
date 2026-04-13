using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
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
