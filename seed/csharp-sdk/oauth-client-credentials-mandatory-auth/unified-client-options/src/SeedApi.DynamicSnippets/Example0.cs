using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                Token = "<token>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenwithclientcredentialsAsync(
            new AuthGetTokenWithClientCredentialsRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = AuthGetTokenWithClientCredentialsRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenWithClientCredentialsRequestGrantType.ClientCredentials
            }
        );
    }

}
