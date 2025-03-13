using global::System.Threading.Tasks;
using SeedCustomAuth;
using SeedCustomAuth.Core;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCustomAuthClient(
            customAuthScheme: "<value>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CustomAuth.PostWithCustomAuthAsync(
            new Dictionary<string, object>() {
                ["key"] = "value",
            }
        );
    }

}
