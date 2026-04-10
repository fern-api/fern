using SeedInferredAuthExplicit;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedInferredAuthExplicitClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
