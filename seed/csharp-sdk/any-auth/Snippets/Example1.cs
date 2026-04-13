using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedAnyAuthClient(
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
