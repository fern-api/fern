using SeedMixedCase;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedMixedCaseClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetResourceAsync(
            "rsc-xyz"
        );
    }

}
