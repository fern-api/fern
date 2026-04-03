using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedApiClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Plants.GetAsync(
            new GetPlantsRequest {
                PlantId = "plantId"
            }
        );
    }

}
