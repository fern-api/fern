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
            tenantId: "tenant_id",
            userId: "user_id",
            request: new SearchUsersRequest {
                Limit = 1
            }
        );
    }

}
