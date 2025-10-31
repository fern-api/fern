using SeedPagination;

namespace Usage;

public class Example15
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithBodyCursorPaginationAsync(
            new SeedPagination.ListUsersBodyCursorPaginationRequest {
                Pagination = new SeedPagination.WithCursor {
                    Cursor = "cursor"
                }
            }
        );
    }

}
