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
            "tenant_id",
            "user_id",
            1,
            new GetUserMetadataRequest()
        );
    }

}
