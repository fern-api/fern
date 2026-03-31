using SeedExhaustive;
using SeedExhaustive.Endpoints;

namespace Usage;

public class Example33
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAndQueryAsync(
            "param",
            new GetWithPathAndQuery {
                Query = "query"
            }
        );
    }

}
