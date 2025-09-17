using SeedOauthClientCredentials;
using System.Threading.Tasks;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
