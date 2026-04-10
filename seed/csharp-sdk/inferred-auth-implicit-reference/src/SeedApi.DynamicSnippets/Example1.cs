using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenwithclientcredentialsAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = GetTokenRequestAudience.HttpsApiExampleCom,
                GrantType = GetTokenRequestGrantType.ClientCredentials,
                Scope = "scope"
            }
        );
    }

}
