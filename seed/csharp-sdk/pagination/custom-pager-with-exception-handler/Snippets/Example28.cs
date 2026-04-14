using SeedPagination;

public partial class Examples
{
    public async Task Example28() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListUsernamesWithOptionalResponseAsync(
            new ListUsernamesWithOptionalResponseRequest {
                StartingAfter = "starting_after"
            }
        );
    }

}
