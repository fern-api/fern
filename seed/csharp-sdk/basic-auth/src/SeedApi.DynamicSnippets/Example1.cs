using SeedBasicAuth;
using System.Threading.Tasks;

namespace Usage;

public class Example1
{
    public async Task Do() {
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
