using SeedInferredAuthImplicitApiKey;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitApiKeyClient(
            apiKey: "X-Api-Key",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
