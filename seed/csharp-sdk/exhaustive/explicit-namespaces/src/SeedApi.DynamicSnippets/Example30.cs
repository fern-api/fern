using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

namespace Usage;

public class Example30
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithQueryAsync(
            new SeedExhaustive.Endpoints.Params.GetWithQuery{
                Query = "query",
                Number = 1
            }
        );
    }

}
