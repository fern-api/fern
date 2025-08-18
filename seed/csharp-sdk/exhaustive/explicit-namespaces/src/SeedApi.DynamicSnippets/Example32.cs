using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

namespace Usage;

public class Example32
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAndQueryAsync(
            "param",
            new SeedExhaustive.Endpoints.Params.GetWithPathAndQuery{
                Query = "query"
            }
        );
    }

}
