using SeedInferredAuthImplicit;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitClient(
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
