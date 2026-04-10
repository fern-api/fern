using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
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
