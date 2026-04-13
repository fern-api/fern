using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedApi.NestedApiGetSomethingAsync();
    }

}
