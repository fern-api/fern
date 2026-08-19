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
                TreeSpecies = "treeSpecies",
                HeightInFeet = 1.1,
                Id = "id",
                TreeName = "treeName",
                TreeDescription = "treeDescription",
                PlantedDate = DateOnly.Parse("2023-01-15")
            }
        );
    }

}
