using SeedPagination;

public partial class Examples
{
    public async Task Example27() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListUsernamesAsync(
            new SeedPagination.ListUsernamesRequest {
                StartingAfter = "starting_after"
            }
        );
    }

}
