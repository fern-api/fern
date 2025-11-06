using SeedPathParameters;

namespace Usage;

public class Example7
{
    public async Task Do() {
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
