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
            "tenant_id",
            "user_id",
            new SearchUsersRequest {
                Limit = 1
            }
        );
    }

}
