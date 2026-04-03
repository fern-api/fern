using SeedContentTypes;

public partial class Examples
{
    public async Task Example2() {
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
