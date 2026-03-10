using SeedServerSentEvents;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsAsync(
            new StreamEventsRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
