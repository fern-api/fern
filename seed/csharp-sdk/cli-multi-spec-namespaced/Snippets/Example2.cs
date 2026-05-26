using SeedApi;
using SeedApi.V2;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient(
            token: "<token>",
            apiKey: "<X-Api-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.ListUsersAsync(
            new ListUsersRequest()
        );
    }

}
