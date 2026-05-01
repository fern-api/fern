using SeedPagination;

public partial class Examples
{
    public async Task Example7() {
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
