using SeedApi;

namespace Usage;

public class Example17
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsync(
            new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest {
                Page = 1,
                Limit = 1,
                Order = InlineUsersOrder.Asc
            }
        );
    }

}
