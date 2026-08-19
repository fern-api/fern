using SeedApi;

public partial class Examples
{
    public async Task Example4() {
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
