using SeedExhaustive;
using System.Threading.Tasks;

namespace Usage;

public class Example28
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.ModifyWithPathAsync(
            "param",
            "string"
        );
    }

}
