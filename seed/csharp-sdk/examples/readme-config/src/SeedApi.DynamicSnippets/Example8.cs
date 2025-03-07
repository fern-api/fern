using global::System.Threading.Tasks;
using SeedExamples;
using SeedExamples.Core;

namespace Usage;

public class Example8
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Health.Service.CheckAsync(
            "id-3tey93i"
        );
    }

}
