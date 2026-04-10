using SeedApi;

namespace Usage;

public class Example17
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetmetadataAsync(
            new ServiceGetMetadataRequest {
                ApiVersion = "X-API-Version"
            }
        );
    }

}
