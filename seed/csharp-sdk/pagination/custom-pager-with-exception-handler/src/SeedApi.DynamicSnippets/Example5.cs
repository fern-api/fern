using SeedApi;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedApiClient(
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
