using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedInferredAuthExplicitClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenwithclientcredentialsAsync(
            new AuthGetTokenWithClientCredentialsRequest {
                ApiKey = "apiKey",
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = AuthGetTokenWithClientCredentialsRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenWithClientCredentialsRequestGrantType.ClientCredentials,
                Scope = "scope"
            }
        );
    }

}
