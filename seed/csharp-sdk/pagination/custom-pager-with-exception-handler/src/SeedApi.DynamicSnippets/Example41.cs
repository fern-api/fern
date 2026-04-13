using SeedApi;

namespace Usage;

public class Example41
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithoffsetsteppaginationAsync(
            new UsersListWithOffsetStepPaginationRequest {
                Page = 1,
                Limit = 1,
                Order = Order.Asc
            }
        );
    }

}
