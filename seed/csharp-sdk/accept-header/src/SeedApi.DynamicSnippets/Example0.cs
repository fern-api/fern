using SeedAccept;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedAcceptClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.EndpointAsync();
    }

}
