using SeedApi;

public partial class Examples
{
    public async Task Example29() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithmixedtypecursorpaginationAsync(
            new UsersListWithMixedTypeCursorPaginationRequest {
                Cursor = "cursor"
            }
        );
    }

}
