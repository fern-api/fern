using SeedUnions;

public partial class Examples
{
    public async Task Example4() {
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
