using SeedApi;

namespace Usage;

public class Example3
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
                    ["key"] = "value",
                }

            }
        );
    }

}
