using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithCursorPaginationAsync(
            new InlineUsersInlineUsersListWithCursorPaginationRequest {
                Page = 1,
                PerPage = 1,
                Order = InlineUsersOrder.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
