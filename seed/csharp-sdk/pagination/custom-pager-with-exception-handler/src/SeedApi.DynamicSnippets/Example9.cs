using SeedApi;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationAsync(
            new InlineUsersInlineUsersListWithOffsetPaginationRequest {
                Page = 1,
                PerPage = 1,
                Order = InlineUsersOrder.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
