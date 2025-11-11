using SeedAnyAuth;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedAnyAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetAdminsAsync();
    }

}
