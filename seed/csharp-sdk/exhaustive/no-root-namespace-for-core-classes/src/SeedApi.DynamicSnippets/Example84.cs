using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example84
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBoolAsync(
            true
        );
    }

}
