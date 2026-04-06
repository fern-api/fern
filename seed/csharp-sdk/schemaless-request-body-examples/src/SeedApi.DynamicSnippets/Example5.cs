using SeedApi;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreatePlantWithSchemaAsync(
            new CreatePlantWithSchemaRequest {
                Name = "name",
                Species = "species"
            }
        );
    }

}
