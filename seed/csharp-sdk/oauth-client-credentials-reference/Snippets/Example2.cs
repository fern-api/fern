using SeedOauthClientCredentialsReference;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedOauthClientCredentialsReferenceClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
