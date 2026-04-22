using SeedApi;

public partial class Examples
{
    public async Task Example12() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.FetchAsync(
            new FetchRequest()
        );
    }

}
