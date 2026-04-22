using SeedPagination;

public partial class Examples
{
    public async Task Example15() {
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
