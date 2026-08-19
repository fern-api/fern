using SeedUnions;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetAsync(
            "id"
        );
    }

}
