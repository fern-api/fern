using SeedApi;

namespace Usage;

public class Example34
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingSseOnlyAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
