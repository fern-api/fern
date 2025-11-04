using SeedCustomAuth;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedCustomAuthClient(
            customAuthScheme: "<value>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CustomAuth.PostWithCustomAuthAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
