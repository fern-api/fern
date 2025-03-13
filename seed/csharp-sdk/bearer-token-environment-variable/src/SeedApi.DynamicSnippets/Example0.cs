using global::System.Threading.Tasks;
using SeedBearerTokenEnvironmentVariable;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedBearerTokenEnvironmentVariableClient(
            apiKey: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
