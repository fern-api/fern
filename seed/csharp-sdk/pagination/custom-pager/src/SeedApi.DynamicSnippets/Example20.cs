using SeedPagination;

namespace Usage;

public class Example20
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithOffsetStepPaginationAsync(
            new SeedPagination.ListUsersOffsetStepPaginationRequest {
                Page = 1,
                Limit = 1,
                Order = SeedPagination.Order.Asc
            }
        );
    }

}
