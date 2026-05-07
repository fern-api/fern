using SeedApi;
using SeedApi.Reqwithheaders;

namespace Usage;

public class Example10
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reqwithheaders.GetwithcustomheaderAsync(
            new GetwithcustomheaderReqwithheadersRequest {
                TestEndpointHeader = "testEndpointHeader",
                Body = "string"
            }
        );
    }

}
