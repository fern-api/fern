using SeedPaginationUriPath;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedPaginationUriPathClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithPathPaginationAsync();
    }

}
