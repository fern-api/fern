using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            new ServicePostRequest {
                PathParam = "pathParam",
                ServiceParam = "serviceParam",
                EndpointParam = 1,
                ResourceParam = "resourceParam"
            }
        );
    }

}
