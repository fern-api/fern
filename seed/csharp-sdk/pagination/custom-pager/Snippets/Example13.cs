using SeedApi;

public partial class Examples
{
    public async Task Example13() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyOffsetPaginationAsync(
            new InlineUsersInlineUsersListWithBodyOffsetPaginationRequest {
                Pagination = new InlineUsersWithPage {
                    Page = 1
                }
            }
        );
    }

}
