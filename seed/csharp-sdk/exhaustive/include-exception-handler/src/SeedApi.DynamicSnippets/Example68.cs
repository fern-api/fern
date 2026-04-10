using SeedApi;

namespace Usage;

public class Example68
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsParams.EndpointsParamsGetWithPathAndQueryAsync(
            new EndpointsParamsGetWithPathAndQueryRequest {
                Param = "param",
                Query = "query"
            }
        );
    }

}
