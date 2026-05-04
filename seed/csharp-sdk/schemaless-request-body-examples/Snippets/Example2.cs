using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.UpdatePlantAsync(
            new UpdatePlantRequest {
                PlantId = "plantId",
                Body = new Dictionary<string, object>()
                {
                    ["name"] = "Updated Venus Flytrap",
                    ["care"] = new Dictionary<string, object>()
                    {
                        ["light"] = "partial shade",
                    }
                    ,
                }

            }
        );
    }

}
