using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example21
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsEnum.EndpointsEnumGetAndReturnEnumAsync(
            TypesWeatherReport.Sunny
        );
    }

}
