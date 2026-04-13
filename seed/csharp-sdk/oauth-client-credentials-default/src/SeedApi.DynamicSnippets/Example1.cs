using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenAsync(
            new AuthGetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = AuthGetTokenRequestGrantType.ClientCredentials
            }
        );
    }

}
