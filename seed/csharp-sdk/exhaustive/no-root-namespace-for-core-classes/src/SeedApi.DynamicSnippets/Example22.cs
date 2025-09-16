using SeedExhaustive;
using System.Threading.Tasks;
using SeedExhaustive.Core;

namespace Usage;

public class Example22
{
    public async Task Do() {
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
