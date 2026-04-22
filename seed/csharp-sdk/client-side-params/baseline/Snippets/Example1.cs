using SeedClientSideParams;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetResourceAsync(
            "resourceId",
            new GetResourceRequest {
                IncludeMetadata = true,
                Format = "json"
            }
        );
    }

}
