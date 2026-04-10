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
            "tenant_id",
            "user_id",
            new UserSearchUsersRequest()
        );
    }

}
