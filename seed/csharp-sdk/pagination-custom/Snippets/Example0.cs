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

        await client.Users.ListWithCustomPagerAsync(
            new ListWithCustomPagerRequest {
                Limit = 1,
                StartingAfter = "starting_after"
            }
        );
    }

}
