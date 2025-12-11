using SeedWebsocketAuth;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedWebsocketAuthClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshTokenAsync(
            new RefreshTokenRequest {
                XApiKey = "X-Api-Key",
                ClientId = "client_id",
                ClientSecret = "client_secret",
                RefreshToken = "refresh_token",
                Audience = "https://api.example.com",
                GrantType = "refresh_token",
                Scope = "scope"
            }
        );
    }

}
