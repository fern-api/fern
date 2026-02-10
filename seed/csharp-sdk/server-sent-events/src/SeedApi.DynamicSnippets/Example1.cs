using SeedServerSentEvents;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamWithoutTerminatorAsync(
            new StreamCompletionRequestWithoutTerminator {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
