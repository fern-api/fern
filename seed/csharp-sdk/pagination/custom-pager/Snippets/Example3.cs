using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedPaginationClient(
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
