using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreatePlantAsync(
            new Dictionary<string, object>()
            {
                ["name"] = "Venus Flytrap",
                ["species"] = "Dionaea muscipula",
                ["care"] = new Dictionary<string, object>()
                {
                    ["light"] = "full sun",
                    ["water"] = "distilled only",
                    ["humidity"] = "high",
                }
                ,
                ["tags"] = new List<object>()
                {
                    "carnivorous",
                    "tropical",
                }
                ,
            }
        );
    }

}
