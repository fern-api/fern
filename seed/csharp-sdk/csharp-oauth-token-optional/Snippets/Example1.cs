using SeedCsharpOauthTokenOptional;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedCsharpOauthTokenOptionalClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.CreateOauth2TokenAsync(
            new CreateOauth2TokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "grant_type"
            }
        );
    }

}
