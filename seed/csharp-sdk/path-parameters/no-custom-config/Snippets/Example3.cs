using SeedPathParameters;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserAsync(
            new GetUsersRequest {
                TenantId = "tenant_id",
                UserId = "user_id"
            }
        );
    }

}
