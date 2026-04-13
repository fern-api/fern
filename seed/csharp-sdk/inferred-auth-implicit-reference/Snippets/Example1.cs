using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedInferredAuthImplicitClient(
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
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
