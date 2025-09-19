using SeedExhaustive;
using System.Threading.Tasks;
using SeedExhaustive.Endpoints;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithQueryAsync(
            new GetWithQuery{
                Query = "query",
                Number = 1
            }
        );
    }

}
