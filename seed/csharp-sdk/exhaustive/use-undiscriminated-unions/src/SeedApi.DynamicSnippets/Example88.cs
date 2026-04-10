using SeedApi;

namespace Usage;

public class Example88
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDateAsync(
            DateOnly.Parse("2023-01-15")
        );
    }

}
