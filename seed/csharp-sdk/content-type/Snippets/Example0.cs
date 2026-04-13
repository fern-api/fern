using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PatchAsync(
            new ServicePatchRequest()
        );
    }

}
