using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.GetAsync(
            new BigunionGetRequest {
                Id = "id"
            }
        );
    }

}
