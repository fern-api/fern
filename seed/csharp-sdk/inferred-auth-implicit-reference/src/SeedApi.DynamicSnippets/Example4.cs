using SeedInferredAuthImplicit;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitClient(
            clientId: "client_id",
            clientSecret: "client_secret",
            scope: "scope",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
