using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrimAsync(
            new Dictionary<string, string>(){
                ["key"] = "value",
            }
        );
    }

}
