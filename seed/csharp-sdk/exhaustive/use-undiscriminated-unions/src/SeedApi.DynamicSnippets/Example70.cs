using SeedApi;

namespace Usage;

public class Example70
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsParams.EndpointsParamsGetWithInlinePathAndQueryAsync(
            new EndpointsParamsGetWithInlinePathAndQueryRequest {
                Param = "param",
                Query = "query"
            }
        );
    }

}
