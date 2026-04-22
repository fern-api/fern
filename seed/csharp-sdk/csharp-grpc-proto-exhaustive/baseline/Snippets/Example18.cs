using SeedApi;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PostFooAsync();
    }

}
