using SeedPathParameters;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserMetadataAsync(
            tenantId: "tenant_id",
            userId: "user_id",
            version: 1,
            request: new GetUserMetadataRequest()
        );
    }

}
