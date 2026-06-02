using SeedPathParameters;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserSpecificsAsync(
            new GetUserSpecificsRequest {
                UserId = "user_id",
                Version = 1,
                Thought = "thought",
                TenantId = "tenant_id"
            }
        );
    }

}
