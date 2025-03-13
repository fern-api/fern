using global::System.Threading.Tasks;
using SeedAccept;
using SeedAccept.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAcceptClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.EndpointAsync();
    }

}
