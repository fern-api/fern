using SeedPagination;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithOffsetPaginationHasNextPageAsync(
            new SeedPagination.InlineUsers.ListWithOffsetPaginationHasNextPageRequest {
                Page = 1,
                Limit = 1,
                Order = SeedPagination.InlineUsers.Order.Asc
            }
        );
    }

}
