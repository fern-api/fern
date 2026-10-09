using SeedApi;

public partial class Examples
{
    public async Task Example13() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTreeAsync(
            new TreeRecord {
                Id = "id",
                TreeName = "treeName",
                TreeDescription = "treeDescription",
                TreeSpecies = "treeSpecies",
                HeightInFeet = 1.1,
                PlantedDate = DateOnly.Parse("2023-01-15")
            }
        );
    }

}
