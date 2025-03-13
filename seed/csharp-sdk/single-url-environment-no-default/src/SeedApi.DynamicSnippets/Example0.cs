using global::System.Threading.Tasks;
using SeedSingleUrlEnvironmentNoDefault;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedSingleUrlEnvironmentNoDefaultClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GetDummyAsync();
    }

}
