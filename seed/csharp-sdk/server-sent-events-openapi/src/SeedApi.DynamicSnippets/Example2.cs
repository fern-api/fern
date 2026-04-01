using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamProtocolCollisionAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
