using SeedPagination;


public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListUsernamesCustomAsync(
            new ListUsernamesRequestCustom {
                StartingAfter = "starting_after"
            }
        );
    }

}
