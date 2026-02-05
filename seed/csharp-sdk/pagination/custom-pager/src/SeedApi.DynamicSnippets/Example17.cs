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

        await client.Users.ListWithTopLevelBodyCursorPaginationAsync(
            new ListUsersTopLevelBodyCursorPaginationRequest {
                Cursor = "cursor",
                Filter = "filter"
            }
        );
    }

}
