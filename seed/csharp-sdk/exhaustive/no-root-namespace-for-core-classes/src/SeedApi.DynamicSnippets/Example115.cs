using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example115
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reqwithheaders.GetwithcustomheaderAsync(
            new ReqWithHeadersGetWithCustomHeaderRequest {
                TestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
                Body = "string"
            }
        );
    }

}
