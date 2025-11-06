using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;

namespace Usage;

public class Example23
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithQueryAsync(
            new GetWithQuery {
                Query = "query",
                Number = 1
            }
        );
    }

}
