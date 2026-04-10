using SeedApi;

namespace Usage;

public class Example94
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsPut.EndpointsPutAddAsync(
            new EndpointsPutAddRequest {
                Id = "id"
            }
        );
    }

}
