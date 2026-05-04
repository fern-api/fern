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
            "tenant_id",
            "user_id",
            new GetUsersRequest()
        );
    }

}
