using SeedUnions;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.UpdateAsync(
            new Dictionary<string, object>()
            {
                ["type"] = "circle",
                ["radius"] = 1.1,
                ["id"] = "id",
            }
        );
    }

}
