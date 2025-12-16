using SeedVersion;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedVersionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserAsync(
            "userId"
        );
    }

}
