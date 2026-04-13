using SeedApi;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAsync(
            new InlineUsersInlineUsersListWithExtendedResultsRequest()
        );
    }

}
