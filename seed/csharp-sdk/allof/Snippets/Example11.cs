using SeedApi;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreatePlantAsync(
            new PlantPost {
                CommonName = "commonName",
                WateringFrequency = PlantBaseWateringFrequency.Daily,
                Species = "species",
                Family = "family",
                Genus = "genus",
                SunExposure = PlantPostSunExposure.Full,
                PlantedAt = DateOnly.Parse("2023-01-15"),
                SoilType = "soilType"
            }
        );
    }

}
