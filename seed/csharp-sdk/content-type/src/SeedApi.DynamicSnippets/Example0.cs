using SeedContentTypes;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PatchAsync(
            new PatchProxyRequest {
                Application = "application",
                RequireAuth = true
            }
        );
    }

}
