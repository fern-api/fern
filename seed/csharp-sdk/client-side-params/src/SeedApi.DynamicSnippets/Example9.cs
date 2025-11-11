using SeedClientSideParams;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetConnectionAsync(
            "connectionId",
            new GetConnectionRequest {
                Fields = "fields"
            }
        );
    }

}
