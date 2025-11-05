using SeedPagination;

namespace Usage;

public class Example12
{
    public async Task Do() {
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
