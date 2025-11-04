using SeedPagination;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithOffsetStepPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersOffsetStepPaginationRequest {
                Page = 1,
                Limit = 1,
                Order = SeedPagination.InlineUsers.Order.Asc
            }
        );
    }

}
