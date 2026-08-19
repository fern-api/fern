using SeedPagination;

public partial class Examples
{
    public async Task Example14() {
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
