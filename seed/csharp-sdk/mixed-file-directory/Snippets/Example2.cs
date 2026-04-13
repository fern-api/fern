using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.ListAsync(
            new UserListRequest()
        );
    }

}
