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
            tenantId: "tenant_id",
            userId: "user_id",
            version: 1,
            thought: "thought",
            request: new GetUserSpecificsRequest()
        );
    }

}
