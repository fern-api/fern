using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenAsync(
            new AuthGetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = AuthGetTokenRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenRequestGrantType.ClientCredentials,
                Scope = "scope"
            }
        );
    }

}
