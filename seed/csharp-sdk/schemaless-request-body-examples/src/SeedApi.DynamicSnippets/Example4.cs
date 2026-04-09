using SeedApi;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreatePlantWithSchemaAsync(
            new CreatePlantWithSchemaRequest {
                Name = "Sundew",
                Species = "Drosera capensis"
            }
        );
    }

}
