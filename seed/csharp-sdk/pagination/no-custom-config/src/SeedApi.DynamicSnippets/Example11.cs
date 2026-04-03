using SeedPagination;

public partial class Examples
{
    public static async Task Example11()
    {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListUsernamesAsync(
            new SeedPagination.InlineUsers.ListUsernamesRequest {
                StartingAfter = "starting_after"
            }
        );
    }

}
