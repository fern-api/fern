using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedAnyAuthClient(
            token: "<token>",
            apiKey: "<X-API-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetAsync();
    }

}
