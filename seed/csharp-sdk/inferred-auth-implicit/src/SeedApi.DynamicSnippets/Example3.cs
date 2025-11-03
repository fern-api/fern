using SeedInferredAuthImplicit;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
