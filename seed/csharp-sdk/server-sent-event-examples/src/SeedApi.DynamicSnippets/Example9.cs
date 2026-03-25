using SeedServerSentEvents;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsContextProtocolAsync(
            new StreamEventsContextProtocolRequest {
                Query = ""
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
