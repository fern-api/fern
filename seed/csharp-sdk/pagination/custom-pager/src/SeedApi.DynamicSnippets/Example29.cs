using SeedPagination;

namespace Usage;

public class Example29
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithOptionalDataAsync(
            new ListUsersOptionalDataRequest {
                Page = 1
            }
        );
    }

}
