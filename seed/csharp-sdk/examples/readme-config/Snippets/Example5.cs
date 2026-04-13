using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.HealthService.HealthServiceCheckAsync(
            new HealthServiceCheckRequest {
                Id = "id"
            }
        );
    }

}
