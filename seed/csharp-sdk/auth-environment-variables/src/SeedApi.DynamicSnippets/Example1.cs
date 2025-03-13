using global::System.Threading.Tasks;
using SeedAuthEnvironmentVariables;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAuthEnvironmentVariablesClient(
            apiKey: "<value>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithHeaderAsync(
            new HeaderAuthRequest{
                XEndpointHeader = "X-Endpoint-Header"
            }
        );
    }

}
