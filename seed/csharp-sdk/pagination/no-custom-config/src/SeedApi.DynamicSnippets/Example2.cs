using SeedPagination;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersMixedTypeCursorPaginationRequest {
                Cursor = "cursor"
            }
        );
    }

}
