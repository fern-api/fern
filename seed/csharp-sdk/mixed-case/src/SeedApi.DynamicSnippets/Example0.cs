using global::System.Threading.Tasks;
using SeedMixedCase;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMixedCaseClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetResourceAsync(
            "rsc-xyz"
        );
    }

}
