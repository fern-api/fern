using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

namespace Usage;

public class Example24
{
    public async global::System.Threading.Tasks.Task Do() {
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
