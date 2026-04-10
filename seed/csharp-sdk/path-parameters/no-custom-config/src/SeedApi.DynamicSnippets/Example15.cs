using SeedApi;

namespace Usage;

public class Example15
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetusermetadataAsync(
            new UserGetUserMetadataRequest {
                TenantId = "tenant_id",
                UserId = "user_id",
                Version = 1
            }
        );
    }

}
