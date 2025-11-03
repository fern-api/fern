using SeedPagination;

namespace Usage;

public class Example13
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithCursorPaginationAsync(
            new SeedPagination.ListUsersCursorPaginationRequest {
                Page = 1,
                PerPage = 1,
                Order = SeedPagination.Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
