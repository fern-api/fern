using SeedInferredAuthImplicitApiKey;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitApiKeyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
