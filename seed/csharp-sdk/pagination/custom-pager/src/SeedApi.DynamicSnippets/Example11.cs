using SeedPagination;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListUsernamesAsync(
            new SeedPagination.InlineUsers.ListUsernamesRequest {
                StartingAfter = "starting_after"
            }
        );
    }

}
