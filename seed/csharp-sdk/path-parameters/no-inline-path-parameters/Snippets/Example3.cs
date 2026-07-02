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
            tenantId: "tenant_id",
            userId: "user_id",
            request: new GetUsersRequest()
        );
    }

}
