using SeedOauthClientCredentialsEnvironmentVariables;
using System.Threading.Tasks;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsEnvironmentVariablesClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
