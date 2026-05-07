using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

namespace Usage;

public class Example64
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAsync(
            new GetWithPathParamsRequest {
                Param = "param"
            }
        );
    }

}
