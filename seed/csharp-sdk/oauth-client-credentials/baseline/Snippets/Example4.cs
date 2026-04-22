using SeedOauthClientCredentials;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
