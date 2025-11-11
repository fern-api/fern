using SeedPagination;

namespace Usage;

public class Example17
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithDoubleOffsetPaginationAsync(
            new SeedPagination.ListUsersDoubleOffsetPaginationRequest {
                Page = 1.1,
                PerPage = 1.1,
                Order = SeedPagination.Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
