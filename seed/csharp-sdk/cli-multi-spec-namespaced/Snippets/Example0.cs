using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            token: "<token>",
            apiKey: "<X-Api-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V1.ListUsersAsync();
    }

}
