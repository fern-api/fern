using SeedPagination;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithOffsetPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersOffsetPaginationRequest {
                Page = 1,
                PerPage = 1,
                Order = SeedPagination.InlineUsers.Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
