using SeedApi;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
            new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest {
                Page = 1.1,
                PerPage = 1.1,
                Order = InlineUsersOrder.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
