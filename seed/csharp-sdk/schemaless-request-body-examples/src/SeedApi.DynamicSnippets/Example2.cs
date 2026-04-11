using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
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
