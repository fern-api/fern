using SeedInferredAuthImplicitApiKey;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedInferredAuthImplicitApiKeyClient(
            apiKey: "X-Api-Key",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
