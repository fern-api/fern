using SeedPagination;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithDoubleOffsetPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersDoubleOffsetPaginationRequest {
                Page = 1.1,
                PerPage = 1.1,
                Order = SeedPagination.InlineUsers.Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
