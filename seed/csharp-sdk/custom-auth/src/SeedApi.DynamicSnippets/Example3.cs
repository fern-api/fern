using SeedCustomAuth;
using System.Threading.Tasks;

namespace Usage;

public class Example3
{
    public async Task Do() {
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
