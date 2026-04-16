using SeedApi;

public partial class Examples
{
    public async Task Example5() {
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
