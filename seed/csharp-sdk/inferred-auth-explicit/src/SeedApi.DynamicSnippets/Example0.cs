using global::System.Threading.Tasks;
using SeedInferredAuthExplicit;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedInferredAuthExplicitClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest{
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Scope = "scope"
            }
        );
    }

}
