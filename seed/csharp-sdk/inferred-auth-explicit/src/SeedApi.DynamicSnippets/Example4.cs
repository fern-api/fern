using SeedInferredAuthExplicit;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedInferredAuthExplicitClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
