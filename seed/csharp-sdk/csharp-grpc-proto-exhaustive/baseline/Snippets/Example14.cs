using SeedApi;

public partial class Examples
{
    public async Task Example14() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.ListAsync(
            new ListRequest()
        );
    }

}
