using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedMultiLineDocsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetuserAsync(
            new UserGetUserRequest {
                UserId = "userId"
            }
        );
    }

}
