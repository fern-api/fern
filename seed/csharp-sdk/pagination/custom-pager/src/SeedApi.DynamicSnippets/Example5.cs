using SeedPagination;
using System.Threading.Tasks;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithCursorPaginationAsync(
            new ListUsersCursorPaginationRequest{
                Page = 1.1,
                PerPage = 1.1,
                Order = Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
