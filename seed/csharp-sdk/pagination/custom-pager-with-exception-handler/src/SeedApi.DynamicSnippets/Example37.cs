using SeedApi;

namespace Usage;

public class Example37
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithdoubleoffsetpaginationAsync(
            new UsersListWithDoubleOffsetPaginationRequest {
                Page = 1.1,
                PerPage = 1.1,
                Order = Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
