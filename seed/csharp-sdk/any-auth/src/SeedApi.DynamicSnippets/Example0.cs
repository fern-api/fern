using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            apiKey: "<X-API-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenAsync(
            new AuthGetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = AuthGetTokenRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenRequestGrantType.ClientCredentials
            }
        );
    }

}
