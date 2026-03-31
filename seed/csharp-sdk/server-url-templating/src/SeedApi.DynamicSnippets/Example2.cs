using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient();

        await client.GetUserAsync(
            new GetUserRequest {
                UserId = "userId"
            }
        );
    }

}
