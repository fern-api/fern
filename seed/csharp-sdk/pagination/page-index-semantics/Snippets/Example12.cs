using SeedPagination;

public partial class Examples
{
    public async Task Example12() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithGlobalConfigAsync(
            new SeedPagination.InlineUsers.ListWithGlobalConfigRequest {
                Offset = 1
            }
        );
    }

}
