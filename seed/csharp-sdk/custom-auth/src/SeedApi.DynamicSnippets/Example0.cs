using SeedCustomAuth;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedCustomAuthClient(
            customAuthScheme: "<value>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CustomAuth.GetWithCustomAuthAsync();
    }

}
