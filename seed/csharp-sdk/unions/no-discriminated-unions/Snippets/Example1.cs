using SeedUnions;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateAsync(
            new Dictionary<string, object>()
            {
                ["type"] = "normalSweet",
                ["value"] = "value",
                ["id"] = "id",
                ["created-at"] = "2024-01-15T09:30:00Z",
                ["archived-at"] = "2024-01-15T09:30:00Z",
            }
        );
    }

}
