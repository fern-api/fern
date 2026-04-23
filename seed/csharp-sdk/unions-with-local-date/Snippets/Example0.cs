using SeedUnions;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.GetAsync(
            "id"
        );
    }

}
