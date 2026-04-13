using SeedApi;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
            new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest {
                Page = 1.1,
                PerPage = 1.1,
                Order = InlineUsersOrder.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
