using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiWideBasePathClient(
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
