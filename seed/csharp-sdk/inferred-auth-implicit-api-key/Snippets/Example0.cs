using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedInferredAuthImplicitApiKeyClient(
            apiKey: "X-Api-Key",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GettokenAsync(
            new AuthGetTokenRequest {
                ApiKey = "X-Api-Key"
            }
        );
    }

}
