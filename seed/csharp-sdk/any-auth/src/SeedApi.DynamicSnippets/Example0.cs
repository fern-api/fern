using SeedAnyAuth;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedAnyAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = "https://api.example.com",
                GrantType = GrantType.AuthorizationCode,
                Scope = "scope"
            }
        );
    }

}
