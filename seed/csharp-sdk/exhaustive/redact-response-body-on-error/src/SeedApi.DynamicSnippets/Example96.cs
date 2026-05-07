using SeedApi;
using SeedApi.Endpoints;

namespace Usage;

public class Example96
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Put.EndpointsPutAddAsync(
            new EndpointsPutAddPutRequest {
                Id = "id"
            }
        );
    }

}
