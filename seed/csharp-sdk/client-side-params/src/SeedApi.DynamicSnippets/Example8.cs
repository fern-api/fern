using SeedClientSideParams;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListConnectionsAsync(
            new ListConnectionsRequest {
                Strategy = "strategy",
                Name = "name",
                Fields = "fields"
            }
        );
    }

}
