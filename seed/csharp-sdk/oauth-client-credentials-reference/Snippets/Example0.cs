using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedOauthClientCredentialsReferenceClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
