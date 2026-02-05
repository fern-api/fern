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
            "tenant_id",
            "user_id",
            1,
            "thought",
            new GetUserSpecificsRequest()
        );
    }

}
