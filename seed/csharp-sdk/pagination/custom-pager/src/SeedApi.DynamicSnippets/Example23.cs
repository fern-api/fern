using SeedPagination;

namespace Usage;

public class Example23
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithOffsetPaginationHasNextPageAsync(
            new SeedPagination.ListWithOffsetPaginationHasNextPageRequest {
                Page = 1,
                Limit = 10,
                Order = SeedPagination.Order.Asc
            }
        );
    }

}
