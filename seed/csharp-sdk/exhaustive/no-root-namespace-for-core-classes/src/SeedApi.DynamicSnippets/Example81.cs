using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example81
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnLongAsync(
            1000000L
        );
    }

}
