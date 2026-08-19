using SeedPagination;

public partial class Examples
{
    public async Task Example17() {
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
