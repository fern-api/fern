using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreatePlantAsync(
            new PlantPost {
                Species = "species",
                Family = "family",
                Genus = "genus",
                SunExposure = PlantPostSunExposure.Full
            }
        );
    }

}
