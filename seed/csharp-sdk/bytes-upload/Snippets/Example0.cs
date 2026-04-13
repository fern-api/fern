using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBytesUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.ListAsync(
            new UserListRequest {
                Limit = 1
            }
        );
    }

}
