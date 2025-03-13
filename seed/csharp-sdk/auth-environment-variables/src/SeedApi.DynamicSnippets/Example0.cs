using global::System.Threading.Tasks;
using SeedAuthEnvironmentVariables;
using SeedAuthEnvironmentVariables.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAuthEnvironmentVariablesClient(
            apiKey: "<value>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithApiKeyAsync();
    }

}
