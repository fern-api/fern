using SeedPagination;
using System.Threading.Tasks;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsers.InlineUsers.ListWithCursorPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersCursorPaginationRequest {
                StartingAfter = "starting_after"
            }
        );
    }

}
