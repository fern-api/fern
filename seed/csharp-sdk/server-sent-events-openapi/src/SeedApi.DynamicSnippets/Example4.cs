using SeedApi;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamDataContextAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
