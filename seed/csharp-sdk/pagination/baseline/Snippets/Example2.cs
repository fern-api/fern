using SeedPagination;

public partial class Examples
{
    public async Task Example2() {
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
