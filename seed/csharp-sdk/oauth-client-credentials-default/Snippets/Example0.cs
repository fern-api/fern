using SeedOauthClientCredentialsDefault;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedOauthClientCredentialsDefaultClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "client_credentials"
            }
        );
    }

}
