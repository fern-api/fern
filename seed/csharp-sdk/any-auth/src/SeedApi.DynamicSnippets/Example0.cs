using global::System.Threading.Tasks;
using SeedAnyAuth;
using SeedAnyAuth.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAnyAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest{
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Scope = "scope"
            }
        );
    }

}
