using SeedApi;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.NamedpatchwithmixedAsync(
            new ServiceNamedPatchWithMixedRequest {
                Id = "id"
            }
        );
    }

}
