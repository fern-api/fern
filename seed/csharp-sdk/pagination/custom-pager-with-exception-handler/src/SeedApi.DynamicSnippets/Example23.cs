using SeedPagination;

namespace Usage;

public class Example23
{
    public async Task Do() {
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
