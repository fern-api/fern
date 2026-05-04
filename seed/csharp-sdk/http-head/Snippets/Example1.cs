using SeedHttpHead;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedHttpHeadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.ListAsync(
            new ListUsersRequest {
                Limit = 1
            }
        );
    }

}
