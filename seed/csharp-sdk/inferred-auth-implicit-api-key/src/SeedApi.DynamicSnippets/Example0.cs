using SeedInferredAuthImplicitApiKey;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedInferredAuthImplicitApiKeyClient(
            apiKey: "X-Api-Key",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest {
                ApiKey = "api_key"
            }
        );
    }

}
