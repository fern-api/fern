using SeedPagination;

public partial class Examples
{
    public async Task Example16() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithTopLevelBodyCursorPaginationAsync(
            new ListUsersTopLevelBodyCursorPaginationRequest {
                Cursor = "initial_cursor",
                Filter = "active"
            }
        );
    }

}
