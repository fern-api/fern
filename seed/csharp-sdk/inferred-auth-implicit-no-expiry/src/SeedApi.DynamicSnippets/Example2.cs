using SeedInferredAuthImplicitNoExpiry;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitNoExpiryClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
