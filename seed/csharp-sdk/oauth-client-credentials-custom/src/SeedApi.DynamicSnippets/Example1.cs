using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenwithclientcredentialsAsync(
            new AuthGetTokenWithClientCredentialsRequest {
                Cid = "cid",
                Csr = "csr",
                Scp = "scp",
                EntityId = "entity_id",
                Audience = AuthGetTokenWithClientCredentialsRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenWithClientCredentialsRequestGrantType.ClientCredentials,
                Scope = "scope"
            }
        );
    }

}
