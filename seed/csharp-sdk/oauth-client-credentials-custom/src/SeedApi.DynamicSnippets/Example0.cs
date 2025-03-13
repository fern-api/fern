using global::System.Threading.Tasks;
using SeedOauthClientCredentials;
using SeedOauthClientCredentials.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest{
                Cid = "cid",
                Csr = "csr",
                Scp = "scp",
                EntityId = "entity_id",
                Scope = "scope"
            }
        );
    }

}
