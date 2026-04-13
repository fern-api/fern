using SeedApi;

public partial class Examples
{
    public async Task Example23() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListUsernamesAsync(
            new InlineUsersInlineUsersListUsernamesRequest {
                StartingAfter = "starting_after"
            }
        );
    }

}
