using SeedApi;
using SeedApi.EndpointsParams;

namespace Usage;

public class Example65
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsParams.EndpointsParamsGetWithQueryAsync(
            new EndpointsParamsGetWithQueryRequest {
                Query = "query",
                Number = 1
            }
        );
    }

}
