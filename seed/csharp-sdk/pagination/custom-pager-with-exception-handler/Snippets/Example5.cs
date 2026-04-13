using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithMixedTypeCursorPaginationAsync(
            new InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest {
                Cursor = "cursor"
            }
        );
    }

}
