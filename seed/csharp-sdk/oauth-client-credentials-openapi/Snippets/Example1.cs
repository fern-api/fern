using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Identity.GettokenAsync(
            new IdentityGetTokenRequest {
                Username = "username",
                Password = "password"
            }
        );
    }

}
