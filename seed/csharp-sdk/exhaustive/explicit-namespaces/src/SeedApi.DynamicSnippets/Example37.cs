using SeedApi;
using SeedApi.Endpoints.HttpMethods;

namespace Usage;

public class Example37
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.HttpMethodsTestDeleteAsync(
            new HttpMethodsTestDeleteHttpMethodsRequest {
                Id = "id"
            }
        );
    }

}
