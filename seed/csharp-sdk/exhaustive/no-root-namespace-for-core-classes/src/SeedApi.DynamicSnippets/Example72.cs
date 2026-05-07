using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

namespace Usage;

public class Example72
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithQueryAsync(
            new GetWithQueryParamsRequest {
                Query = "query",
                Number = 1
            }
        );
    }

}
