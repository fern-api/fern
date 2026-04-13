using SeedApi;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyCursorPaginationAsync(
            new InlineUsersInlineUsersListWithBodyCursorPaginationRequest {
                Pagination = new InlineUsersWithCursor {
                    Cursor = "cursor"
                }
            }
        );
    }

}
