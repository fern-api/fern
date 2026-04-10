using SeedApi;

namespace Usage;

public class Example80
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
