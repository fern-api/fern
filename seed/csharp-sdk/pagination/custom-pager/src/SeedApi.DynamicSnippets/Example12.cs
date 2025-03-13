using global::System.Threading.Tasks;
using SeedPagination;
using SeedPagination.Core;

namespace Usage;

public class Example12
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithCursorPaginationAsync(
            new ListUsersCursorPaginationRequest{
                StartingAfter = "starting_after"
            }
        );
    }

}
