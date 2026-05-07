using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

namespace Usage;

public class Example67
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithInlinePathAsync(
            new GetWithInlinePathParamsRequest {
                Param = "param"
            }
        );
    }

}
