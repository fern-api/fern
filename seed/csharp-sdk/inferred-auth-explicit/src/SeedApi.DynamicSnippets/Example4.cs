using SeedInferredAuthExplicit;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedInferredAuthExplicitClient(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
