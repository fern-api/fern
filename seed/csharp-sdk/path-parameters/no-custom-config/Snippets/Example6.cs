using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetuserAsync(
            new UserGetUserRequest {
                TenantId = "tenant_id",
                UserId = "user_id"
            }
        );
    }

}
