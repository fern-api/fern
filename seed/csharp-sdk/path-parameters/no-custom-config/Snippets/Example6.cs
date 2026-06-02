using SeedPathParameters;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.SearchUsersAsync(
            new SearchUsersRequest {
                UserId = "user_id",
                TenantId = "tenant_id",
                Limit = 1
            }
        );
    }

}
