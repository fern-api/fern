using SeedPagination;

public partial class Examples
{
    public async Task Example33() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithAliasedDataAsync(
            new ListUsersAliasedDataRequest {
                Page = 1,
                PerPage = 1,
                StartingAfter = "starting_after"
            }
        );
    }

}
