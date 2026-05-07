using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

namespace Usage;

public class Example34
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.HttpMethodsTestGetAsync(
            new HttpMethodsTestGetHttpMethodsRequest {
                Id = "id"
            }
        );
    }

}
