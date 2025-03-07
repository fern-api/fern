using global::System.Threading.Tasks;
using SeedBasicAuth;
using SeedBasicAuth.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedBasicAuthClient(
            username: "<username>",
            password: "<password>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
