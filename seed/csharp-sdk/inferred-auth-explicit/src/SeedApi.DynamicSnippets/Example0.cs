using SeedInferredAuthExplicit;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedInferredAuthExplicitClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest {
                XApiKey = "X-Api-Key",
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = "https://api.example.com",
                GrantType = "client_credentials",
                Scope = "scope"
            }
        );
    }

}
