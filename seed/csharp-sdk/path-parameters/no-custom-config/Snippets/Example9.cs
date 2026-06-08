using SeedPathParameters;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserMetadataAsync(
            new GetUserMetadataRequest {
                TenantId = "tenant_id",
                UserId = "user_id",
                Version = 1
            }
        );
    }

}
