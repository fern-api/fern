using SeedApi;

namespace Usage;

public class Example59
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsParams.EndpointsParamsModifyWithPathAsync(
            new EndpointsParamsModifyWithPathRequest {
                Param = "param",
                Body = "string"
            }
        );
    }

}
