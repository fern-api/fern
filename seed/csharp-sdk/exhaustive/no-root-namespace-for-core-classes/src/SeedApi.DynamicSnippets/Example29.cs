using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace Usage;

public class Example29
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAsync(
            "param"
        );
    }

}
