using SeedApi;

namespace Usage;

public class Example12
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamOasSpecNativeAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
