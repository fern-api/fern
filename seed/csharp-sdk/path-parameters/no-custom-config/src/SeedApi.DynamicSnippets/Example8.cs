using SeedPathParameters;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserSpecificsAsync(
            new GetUserSpecificsRequest {
                TenantId = "tenant_id",
                UserId = "user_id",
                Version = 1,
                Thought = "thought"
            }
        );
    }

}
