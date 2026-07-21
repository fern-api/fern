using SeedApi;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedApiClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Pets.ListAsync();
    }

}
