using SeedApi;

namespace Usage;

public class Example17
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetuserspecificsAsync(
            new UserGetUserSpecificsRequest {
                TenantId = "tenant_id",
                UserId = "user_id",
                Version = 1,
                Thought = "thought"
            }
        );
    }

}
