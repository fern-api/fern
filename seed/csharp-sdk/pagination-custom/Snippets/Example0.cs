using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithcustompagerAsync(
            new UsersListWithCustomPagerRequest()
        );
    }

}
