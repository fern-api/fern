using SeedOauthClientCredentialsDefault;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedOauthClientCredentialsDefaultClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
