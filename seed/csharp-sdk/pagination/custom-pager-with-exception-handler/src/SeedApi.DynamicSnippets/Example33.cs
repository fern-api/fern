using SeedPagination;

namespace Usage;

public class Example33
{
    public async Task Do() {
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
