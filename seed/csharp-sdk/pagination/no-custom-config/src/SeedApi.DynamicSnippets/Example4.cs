using global::System.Threading.Tasks;
using SeedPagination;

namespace Usage;

public class Example4
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
                Page = 1,
                PerPage = 1,
                Order = Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
