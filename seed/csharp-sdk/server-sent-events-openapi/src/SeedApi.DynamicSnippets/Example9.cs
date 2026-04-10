using SeedApi;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamProtocolWithFlatSchemaAsync(
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
