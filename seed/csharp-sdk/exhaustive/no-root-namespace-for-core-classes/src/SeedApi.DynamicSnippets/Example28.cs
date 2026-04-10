using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example28
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsHttpMethods.EndpointsHttpMethodsTestPatchAsync(
            new EndpointsHttpMethodsTestPatchRequest {
                Id = "id",
                Body = new TypesObjectWithOptionalField()
            }
        );
    }

}
