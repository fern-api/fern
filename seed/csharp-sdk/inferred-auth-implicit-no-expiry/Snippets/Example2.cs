using SeedInferredAuthImplicitNoExpiry;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedInferredAuthImplicitNoExpiryClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
