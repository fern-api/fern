using System.Threading.Tasks;
using SeedBasicAuthEnvironmentVariables;

namespace Usage;

public class Example1
{
    public async Task Do()
    {
        var client = new SeedBasicAuthEnvironmentVariablesClient(
            username: "<username>",
            accessToken: "<password>",
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.PostWithBasicAuthAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
