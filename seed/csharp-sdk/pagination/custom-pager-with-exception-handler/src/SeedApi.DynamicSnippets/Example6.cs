using SeedPagination;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithBodyOffsetPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersBodyOffsetPaginationRequest {
                Pagination = new SeedPagination.InlineUsers.WithPage {
                    Page = 1
                }
            }
        );
    }

}
