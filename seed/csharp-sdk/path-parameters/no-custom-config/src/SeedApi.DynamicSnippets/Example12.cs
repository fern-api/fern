using SeedApi;

namespace Usage;

public class Example12
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.SearchusersAsync(
            new UserSearchUsersRequest {
                TenantId = "tenant_id",
                UserId = "user_id"
            }
        );
    }

}
