using SeedUnions;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateManyAsync(
            new List<object>(){
                new Dictionary<string, object>()
                {
                    ["type"] = "normalSweet",
                    ["value"] = "value",
                    ["id"] = "id",
                    ["created-at"] = "2024-01-15T09:30:00Z",
                    ["archived-at"] = "2024-01-15T09:30:00Z",
                }
                ,
                new Dictionary<string, object>()
                {
                    ["type"] = "normalSweet",
                    ["value"] = "value",
                    ["id"] = "id",
                    ["created-at"] = "2024-01-15T09:30:00Z",
                    ["archived-at"] = "2024-01-15T09:30:00Z",
                }
                ,
            }
        );
    }

}
