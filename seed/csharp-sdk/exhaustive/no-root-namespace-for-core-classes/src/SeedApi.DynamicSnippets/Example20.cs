using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example20
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
            new Dictionary<string, string>(){
                ["string"] = "string",
            }
        );
    }

}
