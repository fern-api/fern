using SeedServerSentEvents;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsContextProtocolAsync(
            new StreamEventsContextProtocolRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
