using SeedRequestParameters;
using System.Threading.Tasks;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUsernameOptionalAsync(
            new CreateUsernameBodyOptionalProperties()
        );
    }

}
