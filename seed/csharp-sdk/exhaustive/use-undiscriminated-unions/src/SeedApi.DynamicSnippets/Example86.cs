using SeedApi;
using System.Globalization;

namespace Usage;

public class Example86
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
        );
    }

}
