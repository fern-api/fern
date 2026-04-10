using SeedApi;
using SeedApi.EndpointsParams;

namespace Usage;

public class Example56
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsParams.EndpointsParamsGetWithPathAsync(
            new EndpointsParamsGetWithPathRequest {
                Param = "param"
            }
        );
    }

}
