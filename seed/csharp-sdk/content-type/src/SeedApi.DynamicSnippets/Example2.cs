using SeedContentTypes;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.NamedPatchWithMixedAsync(
            "id",
            new NamedMixedPatchRequest {
                AppId = "appId",
                Instructions = "instructions",
                Active = true
            }
        );
    }

}
