using SeedUnions;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.GetAsync(
            "datetime-example"
        );
    }

}
