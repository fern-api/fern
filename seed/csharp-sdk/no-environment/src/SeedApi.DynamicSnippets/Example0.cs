using global::System.Threading.Tasks;
using SeedNoEnvironment;
using SeedNoEnvironment.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNoEnvironmentClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GetDummyAsync();
    }

}
