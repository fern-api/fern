using SeedClientSideParams;

namespace Usage;

public class Example1
{
    public async Task Do() {
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
