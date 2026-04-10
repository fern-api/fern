using SeedApi;

namespace Usage;

public class Example14
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetusermetadataAsync(
            "tenant_id",
            "user_id",
            1,
            new UserGetUserMetadataRequest()
        );
    }

}
