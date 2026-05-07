using SeedApi;
using SeedApi.Endpoints;

namespace Usage;

public class Example76
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
            new GetWithInlinePathAndQueryParamsRequest {
                Param = "param",
                Query = "query"
            }
        );
    }

}
