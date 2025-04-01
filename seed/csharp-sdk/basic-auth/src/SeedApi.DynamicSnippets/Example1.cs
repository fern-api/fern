using global::System.Threading.Tasks;
using SeedBasicAuth;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedBasicAuthClient(
            username: "<username>",
            password: "<password>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.PostWithBasicAuthAsync(
            new Dictionary<string, object>() {
                ["key"] = "value",
            }
        );
    }

}
