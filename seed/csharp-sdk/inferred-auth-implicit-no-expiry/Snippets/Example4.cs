using SeedApi;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedInferredAuthImplicitNoExpiryClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuthApi.NestedNoAuthApiGetSomethingAsync();
    }

}
