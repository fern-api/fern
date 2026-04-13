using SeedApi;

public partial class Examples
{
    public async Task Example27() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithcursorpaginationAsync(
            new UsersListWithCursorPaginationRequest {
                Page = 1,
                PerPage = 1,
                Order = Order.Asc,
                StartingAfter = "starting_after"
            }
        );
    }

}
