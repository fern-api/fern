using SeedInferredAuthImplicit;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
