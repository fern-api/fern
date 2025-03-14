using global::System.Threading.Tasks;
using SeedVariables;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedVariablesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            "endpointParam"
        );
    }

}
