using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamProtocolNoCollisionAsync(
            new StreamRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
