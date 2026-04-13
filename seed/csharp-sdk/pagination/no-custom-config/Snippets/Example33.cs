using SeedApi;

public partial class Examples
{
    public async Task Example33() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithtoplevelbodycursorpaginationAsync(
            new UsersListWithTopLevelBodyCursorPaginationRequest {
                Cursor = "cursor",
                Filter = "filter"
            }
        );
    }

}
