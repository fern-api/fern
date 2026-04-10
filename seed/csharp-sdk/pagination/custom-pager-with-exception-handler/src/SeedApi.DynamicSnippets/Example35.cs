using SeedApi;

namespace Usage;

public class Example35
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithoffsetpaginationAsync(
            new UsersListWithOffsetPaginationRequest {
                Page = 1,
                PerPage = 1,
                Order = Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
