using SeedPagination;

namespace Usage;

public class Example14
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithMixedTypeCursorPaginationAsync(
            new SeedPagination.ListUsersMixedTypeCursorPaginationRequest {
                Cursor = "cursor"
            }
        );
    }

}
