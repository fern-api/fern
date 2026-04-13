using SeedApi;

public partial class Examples
{
    public async Task Example15() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetStepPaginationAsync(
            new InlineUsersInlineUsersListWithOffsetStepPaginationRequest {
                Page = 1,
                Limit = 1,
                Order = InlineUsersOrder.Asc
            }
        );
    }

}
