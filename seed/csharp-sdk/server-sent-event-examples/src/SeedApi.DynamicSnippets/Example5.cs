using SeedServerSentEvents;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsAsync(
            new StreamEventsRequest {
                Query = ""
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
