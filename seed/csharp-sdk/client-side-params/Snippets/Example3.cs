using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetresourceAsync(
            new ServiceGetResourceRequest {
                ResourceId = "resourceId",
                IncludeMetadata = true,
                Format = "format"
            }
        );
    }

}
