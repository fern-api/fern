using SeedApi;

namespace Usage;

public class Example14
{
    public async System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.GetuserAsync(
            new SystemGetUserRequest {
                UserId = "userId"
            }
        );
    }

}
