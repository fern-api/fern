using SeedPagination;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithBodyCursorPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersBodyCursorPaginationRequest {
                Pagination = new SeedPagination.InlineUsers.WithCursor {
                    Cursor = "cursor"
                }
            }
        );
    }

}
