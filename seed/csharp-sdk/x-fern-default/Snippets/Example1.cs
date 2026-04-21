using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.TestGetAsync(
            new TestGetRequest {
                Region = "region",
                Limit = "100"
            }
        );
    }

}
